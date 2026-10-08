<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MailboxLicense extends Model
{
    public function bundle()
    {
        return $this->belongsTo(MailboxLicenseBundle::class, 'bundle_id');
    }
    public function assignments()
    {
        return $this->hasMany(MailboxLicenseAssignment::class, 'license_id');
    }
    public function license()
    {
        return $this->belongsTo(MailboxLicense::class, 'license_id', 'id');
    }
    public function mailboxes()
    {
        return $this->hasMany(MyMailbox::class, 'license_id');
    }
    
}
