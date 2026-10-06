<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\EmailCampaign;
use Illuminate\Database\Eloquent\Relations\HasMany;

class App extends Model
{
    use HasFactory;

    public function emailCampaigns()
    {
        return $this->hasMany(
            EmailCampaign::class,
            'app_uuid',
            'uuid'
        );
    }

    public function smsCampaigns()
    {
        return $this->hasMany(SmsCampaign::class, 'app_uuid', 'uuid');
    }

    /**
     * Get all push notifications for the app.
     */
    public function pushNotifications(): HasMany
    {
        return $this->hasMany(PushNotification::class, 'app_id', 'id');
    }
    public function notifications()
    {
        return $this->hasMany(Notification::class, 'app_id');
    }
    public function transactionalEmailLogs()
    {
        return $this->hasMany(TransactionalLogDetection::class, 'app_uuid', 'uuid')
            ->where('api_type', 'email');
    }

    /**
     * Transactional SMS logs relationship
     */
    public function transactionalSmsLogs()
    {
        return $this->hasMany(TransactionalLogDetection::class, 'app_uuid', 'uuid')
            ->where('api_type', 'sms');
    }
    public function organization()
    {
        return $this->belongsTo(Organization::class, 'organization_id', 'id');
    }
    
}
