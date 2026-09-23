<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $guarded = []; // Allow mass assignment

    // OR specify fillable fields explicitly
    protected $fillable = [
        'user_id',
        'organization_id',
        'app_id',
        'action',
        'subject_type',
        'description',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];
}
