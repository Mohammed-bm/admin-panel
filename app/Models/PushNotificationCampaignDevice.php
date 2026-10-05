<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PushNotificationCampaignDevice extends Model
{
    protected $table = 'push_notification_campaign_devices';

    /**
     * Get the push notification that owns this device campaign record.
     */
    public function pushNotification(): BelongsTo
    {
        return $this->belongsTo(PushNotification::class, 'push_notification_id', 'id');
    }
}