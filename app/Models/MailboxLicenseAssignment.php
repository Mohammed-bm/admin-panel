<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MailboxLicenseAssignment extends Model
{
    protected $table = 'mailbox_license_assignments';

    public function license()
    {
        return $this->belongsTo(MailboxLicense::class, 'license_id');
    }

    public function mailbox()
    {
        return $this->belongsTo(MyMailbox::class, 'mailbox_id');
    }
}