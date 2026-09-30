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
}