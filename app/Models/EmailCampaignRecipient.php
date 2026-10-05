<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailCampaignRecipient extends Model
{
    public function emailCampaign()
    {
        return $this->belongsTo(EmailCampaign::class, 'email_campaign_id');
    }
}
