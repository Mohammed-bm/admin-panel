<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    public function sendReports()
    {
        return $this->hasMany(SendReport::class, 'notification_id');
    }
}
