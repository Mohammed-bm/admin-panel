<?php

namespace App\Services;

use App\Models\PaymentStatus;
use Illuminate\Support\Str;

class AdminPaymentService
{
    public function createAdminGrantPayment(
        int $userId,
        int $organizationId,
        ?string $appUuid,
        string $planName
    ): PaymentStatus {
        
        return PaymentStatus::create([
            'puuid' => (string) Str::uuid(),
            'user_id' => $userId,
            'organization_id' => $organizationId,
            'app_uuid' => $appUuid,

            'provider' => 'manual',

            'payment_id' =>
                'ADMIN-GRANT-' . $organizationId . '-' . Str::uuid(),

            'order_id' => null,

            'amount' => 0.00,

            'status' => 'paid',

            'method' => 'admin_grant',

            'reason' => "Plan '{$planName}' assigned by Admin",

            'raw_response' => json_encode([
                'assigned_by' => 'admin',
            ]),
        ]);
    }
}