<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MailboxLicenseBundle extends Model
{
    public function licenses()
    {
        return $this->hasMany(MailboxLicense::class, 'bundle_id');
    }
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'organization_id');
    }
}