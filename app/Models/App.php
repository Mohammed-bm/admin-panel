<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\EmailCampaign;

class App extends Model
{
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
}
