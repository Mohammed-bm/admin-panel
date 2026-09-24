<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StripeSubscription extends Model
{
    protected $fillable = [
        'user_id',
        'organization_id',
        'app_uuid',
        'stripe_customer_id',
        'puuid',
        'subscription_name',
        'stripe_subscription_id',
        'stripe_status',
        'currency',
        'payment_method',
        'source_type',
        'transaction_id',
        'payed_or_unpaid',
        'stripe_price_id',
        'amount',
        'quantity',
        'trial_ends_at',
        'ends_at',
        'start_date',
        'current_period_start',
        'payment_status_id',
    ];
}
