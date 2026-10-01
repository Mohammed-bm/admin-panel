<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SmsMetric extends Model
{
    public function campaign()
    {
        return $this->belongsTo(
            SmsCampaign::class,
            'campaign_id',
            'id'
        );
    }
}
