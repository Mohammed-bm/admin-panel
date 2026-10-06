<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MyMailbox extends Model
{
    use HasFactory;
    protected $table = 'my_mailboxes';

    public function assignments()
    {
        return $this->hasMany(MailboxLicenseAssignment::class, 'mailbox_id');
    }

    public function app()
    {
        return $this->belongsTo(App::class, 'app_id', 'uuid');
    }
    public function license()
    {
        return $this->belongsTo(MailboxLicense::class, 'license_id', 'id');
    }
}
