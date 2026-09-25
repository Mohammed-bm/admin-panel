<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MailboxLicenseBundle extends Model
{
    public function licenses()
    {
        return $this->hasMany(MailboxLicense::class, 'bundle_id');
    }
}