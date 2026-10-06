<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PushNotification extends Model
{
    protected $table = 'push_notifications';

    /**
     * Get the app that owns the push notification.
     */
    public function app(): BelongsTo
    {
        return $this->belongsTo(App::class, 'app_id', 'id');
    }

    /**
     * Get all campaign device records for this notification.
     */
    public function campaignDevices(): HasMany
    {
        return $this->hasMany(PushNotificationCampaignDevice::class, 'push_notification_id', 'id');
    }
    
}
