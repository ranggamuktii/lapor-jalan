<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReportHistory extends Model
{
    protected $fillable = [
        'report_id',
        'old_status',
        'new_status',
        'notes',
    ];

    public function report()
    {
        return $this->belongsTo(Report::class);
    }
}
