<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentStatus extends Model
{
    protected $fillable = ['puuid', 'user_id', 'organization_id', 'app_uuid', 'provider', 'payment_id', 'order_id', 'amount', 'status', 'method', 'reason', 'raw_response',];
}
