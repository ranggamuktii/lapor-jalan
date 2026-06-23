<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $fillable = [
        'user_id',
        'reporter_email',
        'device_id',
        'category_id',
        'title',
        'description',
        'latitude',
        'longitude',
        'photo_path',
        'resolved_photo_path',
        'status',
        'upvotes_count',
        'severity',
        'ai_tags',
        'is_duplicate_of',
        'ai_summary',
    ];

    protected $casts = [
        'ai_tags' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function histories()
    {
        return $this->hasMany(ReportHistory::class);
    }

    public function upvotes()
    {
        return $this->hasMany(ReportUpvote::class);
    }

    public function flags()
    {
        return $this->hasMany(ReportFlag::class);
    }

    public function originalReport()
    {
        return $this->belongsTo(Report::class, 'is_duplicate_of');
    }

    public function duplicates()
    {
        return $this->hasMany(Report::class, 'is_duplicate_of');
    }
}
