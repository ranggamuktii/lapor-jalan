<?php

namespace App\Events;

use App\Models\Report;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReportCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $report;

    public function __construct(Report $report)
    {
        // Load category to make sure it's available in the broadcast payload
        $this->report = $report->load('category');
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('reports'),
        ];
    }
    
    public function broadcastAs(): string
    {
        return 'ReportCreated';
    }
}
