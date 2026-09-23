<?php

namespace App\Services\Billing;

use App\Models\CreditTransaction;
use App\Models\Organization;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PlanWalletCreditService
{
    private const PLAN_CREDITS = [
        'starter' => 1.00,
        'pro' => 5.00,
        'agency' => 10.00,
        'enterprise' => 50.00,
    ];

    public function creditForPlan(
        Organization $organization,
        string $plan,
        ?string $appUuid = null,
        ?string $referenceId = null,
        string $paymentMethod = 'plan_credit'
    ): bool {
        $planSlug = strtolower(trim($plan));
        $amount = self::PLAN_CREDITS[$planSlug] ?? null;

        if ($amount === null) {
            Log::warning('No default wallet credit configured for plan', [
                'organization_id' => $organization->id,
                'plan' => $plan,
            ]);

            return false;
        }

        $referenceId = $referenceId ?: "plan-wallet-credit:{$organization->id}:{$planSlug}";

        return DB::transaction(function () use ($organization, $planSlug, $amount, $appUuid, $referenceId, $paymentMethod) {
            $alreadyCredited = CreditTransaction::where('organization_id', $organization->id)
                ->where('reference_id', $referenceId)
                ->exists();

            if ($alreadyCredited) {
                return false;
            }

            $organization->addCredits($amount, 'USD', $paymentMethod, $appUuid, $referenceId);

            return true;
        });
    }
}