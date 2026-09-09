<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Organization extends Model
{
    protected $table = 'organizations';

    protected $fillable = [
        'balance',
        'name',
        'website',
        'company_size',
        'plan',
        'user_id',
        'api_key',
    ];
}
