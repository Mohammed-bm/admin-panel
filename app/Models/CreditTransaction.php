<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CreditTransaction extends Model
{
    protected $table = 'credit_transactions';

    protected $fillable = [
        'id',
        'organization_id',
        'transaction_type',
        'amount',
        'balance_before',
        'balance_after',
        'currency',
        'payment_method',
        'app_uuid',
        'reference_id',
    ];
}
