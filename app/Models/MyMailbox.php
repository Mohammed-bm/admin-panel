<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class MyMailbox extends Model
{
    protected $table = 'my_mailboxes';

    public function assignments()
    {
        return $this->hasMany(MailboxLicenseAssignment::class, 'mailbox_id');
    }
}
