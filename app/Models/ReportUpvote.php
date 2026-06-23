<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReportUpvote extends Model
{
    protected $fillable = [
        'report_id',
        'ip_address',
        'device_id',
    ];

    public function report()
    {
        return $this->belongsTo(Report::class);
    }
}
