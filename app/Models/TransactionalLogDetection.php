<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionalLogDetection extends Model
{
    protected $table = 'transactional_logs_detection';

    public function appByUuid()
    {
        return $this->belongsTo(App::class, 'app_uuid', 'uuid');
    }
}
