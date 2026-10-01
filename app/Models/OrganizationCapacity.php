<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrganizationCapacity extends Model
{
    protected $table = 'organization_capacities';

    protected $fillable = [
        'organization_id',
        'user_id',
        'plan_id',
        'capacities',
        'usage',
        'is_active',
    ];

    protected $casts = [
        'capacities' => 'array',
        'usage' => 'array',
    ];
}
