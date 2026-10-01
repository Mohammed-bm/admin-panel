<?php

namespace App\Services;

use App\Models\App; 
use App\Models\StripeSubscription;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AdminSubscriptionService
{
    public function assignAdminSubscription(
        int $organizationId,
        int $userId,
        string $planName
    ): StripeSubscription {
        return DB::transaction(function () use (
            $organizationId,
            $userId,
            $planName
        ) {

            // 1. Find the current active subscription
            $oldSubscription = StripeSubscription::where(
                'organization_id',
                $organizationId
            )
                ->where('stripe_status', 'active')
                ->latest('id')
                ->first();

            // 2. Get information that needs to be copied
            $appUuid = $oldSubscription?->app_uuid ?? App::where('organization_id', $organizationId)->value('uuid');
            $stripeCustomerId = $oldSubscription?->stripe_customer_id ?? 0;
            $puuid = $oldSubscription?->puuid;

            // 3. Cancel the old subscription record
            if ($oldSubscription) {
                $oldSubscription->update([
                    'stripe_status' => 'canceled',
                ]);
            }

            // 4. Set subscription dates
            $startDate = Carbon::today();
            $endsAt = $startDate->copy()->addMonth();

            // 5. Create the new admin subscription
            return StripeSubscription::create([
                'user_id' => $userId,
                'organization_id' => $organizationId,
                'app_uuid' => $appUuid,
                'stripe_customer_id' => $stripeCustomerId,
                'puuid' => $puuid,

                'subscription_name' => $planName,

                'stripe_subscription_id' => 'admin-' . $organizationId . '-' . uniqid(),
                'stripe_status' => 'active',

                'currency' => null,
                'payment_method' => null,
                'source_type' => 'admin',
                'transaction_id' => null,
                'payed_or_unpaid' => 'unpaid',
                'stripe_price_id' => null,

                'amount' => 0,
                'quantity' => 1,

                'trial_ends_at' => null,
                'start_date' => $startDate,
                'current_period_start' => $startDate,
                'ends_at' => $endsAt,

                'payment_status_id' => null,
            ]);
        });
    }
}
