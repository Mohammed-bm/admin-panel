<?php

namespace App\Services;

use App\Models\App;
use App\Models\TransactionalActivity;

class TransactionalActivityLogger
{
    public static function log(array $attributes): ?TransactionalActivity
    {
        $app = null;

        if (empty($attributes['app_id']) && !empty($attributes['app_uuid'])) {
            $app = App::withoutGlobalScopes()->select('id', 'organization_id')->where('uuid', $attributes['app_uuid'])->first();

            $attributes['app_id'] = $app?->id;
        }

        if (empty($attributes['organization_id']) && $app?->organization_id) {
            $attributes['organization_id'] = $app->organization_id;
        }

        if (empty($attributes['organization_id']) || empty($attributes['user_id'])) {
            return null;
        }

        unset($attributes['app_uuid']);

        return TransactionalActivity::create([
            'organization_id' => $attributes['organization_id'],
            'app_id' => $attributes['app_id'] ?? null,
            'user_id' => $attributes['user_id'],
            'action' => $attributes['action'] ?? 'Activity',
            'channel' => $attributes['channel'] ?? null,
            'qty' => $attributes['qty'] ?? null,
            'used_from' => $attributes['used_from'] ?? null,
            'type' => $attributes['type'] ?? 'debit',
            'credit' => $attributes['credit'] ?? 0,
            'amount' => $attributes['amount'] ?? 0,
            'credit_balance' => $attributes['credit_balance'] ?? null,
            'wallet_balance' => $attributes['wallet_balance'] ?? null,
            'status' => $attributes['status'] ?? 'success',
        ]);
    }
}