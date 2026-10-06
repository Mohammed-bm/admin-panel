<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function app(): BelongsTo
    {
        return $this->belongsTo(App::class, 'app_uuid', 'uuid');
    }

    protected $casts = [
        'current_period_start' => 'datetime',
        'ends_at'              => 'datetime',
        'trial_ends_at'        => 'datetime',
        'start_date'           => 'datetime',
        'created_at'           => 'datetime',
        'updated_at'           => 'datetime',
    ];
}
