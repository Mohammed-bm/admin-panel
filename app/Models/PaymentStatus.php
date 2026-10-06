<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PaymentStatus extends Model
{
    use HasFactory;

    protected $fillable = ['puuid', 'user_id', 'organization_id', 'app_uuid', 'provider', 'payment_id', 'order_id', 'amount', 'status', 'method', 'reason', 'raw_response',];

    public function organization()
    {
        return $this->belongsTo(Organization::class, 'organization_id', 'id');
    }
    public function app()
    {
        return $this->belongsTo(App::class, 'app_uuid', 'uuid');
    }
}
