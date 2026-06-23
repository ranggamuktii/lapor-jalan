<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReportFlag extends Model
{
    use HasFactory;

    protected $fillable = ['report_id', 'ip_address', 'device_id'];

    public function report()
    {
        return $this->belongsTo(Report::class);
    }
}
