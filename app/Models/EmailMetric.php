<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailMetric extends Model
{
    public function emailCampaign()
    {
        return $this->belongsTo(EmailCampaign::class, 'campaign_id');
    }
}
