<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SmsCampaign extends Model
{
    public function metric()
    {
        return $this->hasOne(
            SmsMetric::class,
            'campaign_id',
            'id'
        );
    }

    public function app()
    {
        return $this->belongsTo(
            App::class,
            'app_uuid',
            'uuid'
        );
    }
}
