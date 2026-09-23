<?php

namespace App\Services;

use App\Models\App;
use App\Models\Organization;
use App\Models\OrganizationCapacity;
use App\Models\Plan;
use App\Models\PlanAllowance;
use App\Services\Billing\PlanWalletCreditService;
use Illuminate\Support\Facades\Log;
use App\Models\MailboxLicenseBundle;

class SubscriptionProvisioningService
{
    /**
     * Provisions all downstream dependencies for a new or updated subscription.
     * This includes syncing capacities, provisioning MailSuite licenses, and allocating wallet credits.
     *
     * @param int $userId
     * @param int $organizationId
     * @param string $planSlug
     * @param string|null $appUuid
     * @param string $source (e.g. 'stripe_subscription', 'razorpay_subscription')
     * @param string $eventId (A unique identifier for idempotency, e.g. session id)
     */
    public function provisionPlan(int $userId, int $organizationId, string $planSlug, ?string $appUuid, string $source, string $eventId)
    {
        $organization = Organization::find($organizationId);

        if (!$organization) {
            Log::error("SubscriptionProvisioningService: Organization not found ({$organizationId})");
            return;
        }

        // Update Organization and App plan
        $organization->plan = $planSlug;
        $organization->save();

        if ($appUuid) {
            App::where('uuid', $appUuid)->update(['plan' => $planSlug]);
        } else {
            App::where('organization_id', $organizationId)->update(['plan' => $planSlug]);
        }

        // Find Plan Model
        $plan_lower = strtolower($planSlug);
        $planModel = Plan::where(function ($query) use ($plan_lower) {
            $query->whereRaw('lower(name) = ?', [$plan_lower])
                ->orWhereRaw('lower(slug) = ?', [$plan_lower]);
        })->first();

        if (!$planModel) {
            Log::warning("SubscriptionProvisioningService: Plan '{$planSlug}' not found in DB.");
            return;
        }

        // Apply Wallet Credits
        app(PlanWalletCreditService::class)->creditForPlan(
            $organization,
            $planSlug,
            $appUuid,
            "{$source}-wallet-credit:{$eventId}",
            $source
        );

        // Map Capacities
        $features = PlanAllowance::where('plan_id', $planModel->id)->get();
        $newCapacities = [];

        foreach ($features as $feature) {
            $key = $feature->allowance_key;
            if (strtolower((string) $feature->allowance_value) === 'unlimited') {
                $value = -1;
            } else {
                $value = (int) $feature->allowance_value;
            }
            $newCapacities[$key] = $value;
        }

        // Sync Capacities
        $this->syncOrganizationCapacitiesForSubscription($userId, $organizationId, clone $planModel, $newCapacities, clone $organization);

        Log::info("SubscriptionProvisioningService: Successfully provisioned plan '{$planSlug}' for Org {$organizationId}");
    }

    /**
     * Replicates the exact capacity mapping and mailbox provisioning logic from StripeWebhookController.
     */
    private function syncOrganizationCapacitiesForSubscription(int $userId, int $organizationId, Plan $planModel, array $newCapacities, Organization $organization): void
    {
        $planId = $planModel->id;

        // Ensure the invitation capacity key exists and mirrors role_based_permissions_users when present
        if (isset($newCapacities['role_based_permissions_users']) && !isset($newCapacities['user_invitations'])) {
            $newCapacities['user_invitations'] = $newCapacities['role_based_permissions_users'];
        }

        $payload = [
            'plan_id' => $planId,
            'capacities' => $newCapacities,
            'usage' => [],
            'is_active' => true,
        ];

        $capacityUpdated = false;

        // Update all rows for this user + organization (not just the first record).
        $updatedByUserAndOrg = OrganizationCapacity::where('user_id', $userId)
            ->where('organization_id', $organizationId)
            ->update($payload);

        if ($updatedByUserAndOrg > 0) {
            $capacityUpdated = true;
        }

        if (!$capacityUpdated) {
            // Backward compatibility: if older rows only have organization_id, update all of them and set user_id.
            $orgPayload = $payload;
            $orgPayload['user_id'] = $userId;

            $updatedByOrg = OrganizationCapacity::where('organization_id', $organizationId)
                ->update($orgPayload);

            if ($updatedByOrg === 0) {
                OrganizationCapacity::create([
                    'organization_id' => $organizationId,
                    'user_id' => $userId,
                    'plan_id' => $planId,
                    'capacities' => $newCapacities,
                    'usage' => [],
                    'is_active' => true,
                ]);
            }
        }

        // Provision or Update Mailbox Licenses if nest_mailsuit capacity exists
        if (isset($newCapacities['nest_mailsuit']) && $newCapacities['nest_mailsuit'] != 0) {
            $bundle = \App\Models\MailboxLicenseBundle::where('organization_id', $organizationId)
                ->where('source_type', 'subscription')
                ->first();

            $mailboxesCount = (int) $newCapacities['nest_mailsuit'];
            if ($mailboxesCount == -1) {
                $mailboxesCount = 1000;
            }

            $planSlug = $planModel ? strtolower($planModel->slug) : 'subscription';
            $storageGb = 5;

            $appModel = \App\Models\App::where('organization_id', $organizationId)->first();
            $appUuid = $appModel ? $appModel->uuid : null;

            // Check for expiration in stripe subscriptions or default to 1 year
            $stripeSubscription = \App\Models\StripeSubscription::where('organization_id', $organizationId)
                ->latest()
                ->first();

            $expirationDate = ($stripeSubscription && $stripeSubscription->ends_at)
                ? $stripeSubscription->ends_at
                : now()->addYear();

            if (!$bundle) {
                if ($appUuid) {
                    try {
                        $bundle = new \App\Models\MailboxLicenseBundle();
                        $bundle->license_package_id = null;
                        $bundle->app_id = $appUuid;
                        $bundle->organization_id = $organizationId;
                        $bundle->source_type = 'subscription';
                        $bundle->bundle_name = ($planModel ? $planModel->name : 'Plan') . ' Subscription Licenses';
                        $bundle->license_qty = $mailboxesCount;
                        $bundle->assigned_qty = 0;
                        $bundle->base_storage_gb = $storageGb;
                        $bundle->amount_paid = 0;
                        $bundle->status = 'active';
                        $bundle->starts_at = now();
                        $bundle->expires_at = $expirationDate;
                        $bundle->save();

                        $licensesData = [];
                        $now = now();
                        for ($i = 0; $i < $mailboxesCount; $i++) {
                            $uniqueCode = 'LIC-SUB-' . strtoupper(substr(md5(uniqid()), 0, 6)) . '-' . uniqid();
                            $licensesData[] = [
                                'bundle_id' => $bundle->id,
                                'license_package_id' => null,
                                'license_code' => strtoupper($uniqueCode),
                                'base_storage_gb' => $storageGb,
                                'addon_storage_gb' => 0,
                                'total_storage_gb' => $storageGb,
                                'license_type_key' => $planSlug,
                                'license_type_name' => ($planModel ? $planModel->name : 'Plan') . ' Subscription',
                                'status' => 'available',
                                'expires_at' => $bundle->expires_at,
                                'created_at' => $now,
                                'updated_at' => $now,
                            ];
                        }

                        foreach (array_chunk($licensesData, 500) as $chunk) {
                            \App\Models\MailboxLicense::insert($chunk);
                        }

                        \App\Services\TransactionalActivityLogger::log([
                            'organization_id' => $organizationId,
                            'app_id' => $appModel->id,
                            'user_id' => $userId,
                            'action' => 'Subscription licenses provisioned',
                            'channel' => 'MailSuite',
                            'qty' => $mailboxesCount,
                            'cost' => 0,
                            'status' => 'Success'
                        ]);

                        Log::info("Provisioned $mailboxesCount mailbox licenses for subscription.");
                    } catch (\Exception $e) {
                        Log::error("Failed to provision subscription licenses: " . $e->getMessage());
                    }
                }
            } else {
                try {
                    $oldQty = $bundle->license_qty;
                    $bundle->expires_at = $expirationDate;

                    if ($mailboxesCount > $oldQty) {
                        $bundle->license_qty = $mailboxesCount;
                        $diff = $mailboxesCount - $oldQty;

                        $licensesData = [];
                        $now = now();
                        for ($i = 0; $i < $diff; $i++) {
                            $uniqueCode = 'LIC-SUB-' . strtoupper(substr(md5(uniqid()), 0, 6)) . '-' . uniqid();
                            $licensesData[] = [
                                'bundle_id' => $bundle->id,
                                'license_package_id' => null,
                                'license_code' => strtoupper($uniqueCode),
                                'base_storage_gb' => $storageGb,
                                'addon_storage_gb' => 0,
                                'total_storage_gb' => $storageGb,
                                'license_type_key' => $planSlug,
                                'license_type_name' => ($planModel ? $planModel->name : 'Plan') . ' Subscription',
                                'status' => 'available',
                                'expires_at' => $expirationDate,
                                'created_at' => $now,
                                'updated_at' => $now,
                            ];
                        }

                        foreach (array_chunk($licensesData, 500) as $chunk) {
                            \App\Models\MailboxLicense::insert($chunk);
                        }
                        Log::info("Provisioned $diff extra mailbox licenses for subscription upgrade.");
                    }

                    $bundle->save();

                    \App\Models\MailboxLicense::where('bundle_id', $bundle->id)
                        ->update(['expires_at' => $expirationDate]);

                    Log::info("Updated subscription licenses expiration date to $expirationDate");
                } catch (\Exception $e) {
                    Log::error("Failed to update subscription licenses: " . $e->getMessage());
                }
            }
        }
    }
}