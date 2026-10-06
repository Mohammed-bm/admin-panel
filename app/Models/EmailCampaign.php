<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailCampaign extends Model
{
    public function metric()
    {
        return $this->hasOne(
            EmailMetric::class,
            'campaign_id',
            'id'
        );
    }

    public function recipients()
    {
        return $this->hasMany(
            EmailCampaignRecipient::class,
            'email_campaign_id',
            'id'
        );
    }

    public function app()
    {
        return $this->belongsTo(App::class, 'app_id', 'id');
    }

    public function appByUuid()
    {
        return $this->belongsTo(App::class, 'app_uuid', 'uuid'); // Use 'id' as 3rd arg if apps table uses 'id'
    }
}
