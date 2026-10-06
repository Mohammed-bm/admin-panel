<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    public function sendReports()
    {
        return $this->hasMany(SendReport::class, 'notification_id');
    }
    public function app()
    {
        return $this->belongsTo(App::class, 'app_id', 'id');
    }
}
