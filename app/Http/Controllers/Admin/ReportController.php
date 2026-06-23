<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Report;
use Inertia\Inertia;
use App\Mail\ReportStatusUpdated;
use App\Events\ReportStatusChanged;

class ReportController extends Controller
{
    public function index()
    {
        $reports = Report::with(['user', 'category'])->latest()->get();

        if (request()->wantsJson()) {
            return response()->json($reports);
        }

        return Inertia::render('Admin/Reports/Index', [
            'reports' => $reports
        ]);
    }

    public function validateReport(Report $report, Request $request)
    {
        $oldStatus = $report->status;
        $report->update(['status' => 'validated']);

        // PHASE 3 TIMELINE
        \Illuminate\Support\Facades\DB::table('report_timelines')->insert([
            'report_id' => $report->id,
            'status' => 'divalidasi',
            'description' => 'Laporan telah diverifikasi oleh tim',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $report->histories()->create([
            'old_status' => $oldStatus,
            'new_status' => 'validated',
            'notes' => $request->input('notes', 'Laporan divalidasi'),
        ]);

        broadcast(new ReportStatusChanged($report))->toOthers();

        if ($report->reporter_email) {
            try {
                Mail::to($report->reporter_email)->send(new ReportStatusUpdated($report));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Gagal mengirim email: " . $e->getMessage());
            }
        }

        return back()->with('success', 'Laporan divalidasi');
    }

    public function process(Report $report, Request $request)
    {
        $oldStatus = $report->status;
        $report->update(['status' => 'diproses']);

        // PHASE 3 TIMELINE
        \Illuminate\Support\Facades\DB::table('report_timelines')->insert([
            'report_id' => $report->id,
            'status' => 'diproses',
            'description' => 'Tim penanganan sedang menuju lokasi',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $report->histories()->create([
            'old_status' => $oldStatus,
            'new_status' => 'diproses',
            'notes' => $request->input('notes', 'Laporan sedang diproses'),
        ]);

        broadcast(new ReportStatusChanged($report))->toOthers();

        if ($report->reporter_email) {
            try {
                Mail::to($report->reporter_email)->send(new ReportStatusUpdated($report));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Gagal mengirim email: " . $e->getMessage());
            }
        }

        return back()->with('success', 'Laporan sedang diproses');
    }

    public function reject(Report $report, Request $request)
    {
        $oldStatus = $report->status;
        $report->update(['status' => 'ditolak']);

        // PHASE 3 TIMELINE
        \Illuminate\Support\Facades\DB::table('report_timelines')->insert([
            'report_id' => $report->id,
            'status' => 'ditolak',
            'description' => 'Laporan tidak valid atau bukan wewenang',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $report->histories()->create([
            'old_status' => $oldStatus,
            'new_status' => 'ditolak',
            'notes' => $request->input('notes', 'Laporan ditolak oleh admin'),
        ]);

        broadcast(new ReportStatusChanged($report))->toOthers();

        if ($report->reporter_email) {
            try {
                Mail::to($report->reporter_email)->send(new ReportStatusUpdated($report));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Gagal mengirim email: " . $e->getMessage());
            }
        }

        return back()->with('success', 'Laporan berhasil ditolak');
    }

    public function resolve(Report $report, Request $request)
    {
        $request->validate([
            'notes' => 'nullable|string',
            'resolved_photo' => 'nullable|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        $oldStatus = $report->status;
        $data = ['status' => 'selesai'];

        if ($request->hasFile('resolved_photo')) {
            $data['resolved_photo_path'] = $request->file('resolved_photo')->store('reports/resolved', 'public');
        }

        $report->update($data);

        // PHASE 3 TIMELINE
        \Illuminate\Support\Facades\DB::table('report_timelines')->insert([
            'report_id' => $report->id,
            'status' => 'selesai',
            'description' => 'Perbaikan telah selesai dilakukan',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $report->histories()->create([
            'old_status' => $oldStatus,
            'new_status' => 'selesai',
            'notes' => $request->input('notes', 'Laporan telah diselesaikan'),
        ]);

        broadcast(new ReportStatusChanged($report))->toOthers();

        if ($report->reporter_email) {
            try {
                Mail::to($report->reporter_email)->send(new ReportStatusUpdated($report));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Gagal mengirim email: " . $e->getMessage());
            }
        }

        return back()->with('success', 'Laporan ditandai selesai');
    }
    public function summarize(\App\Services\GeminiAI $geminiAI)
    {
        $reports = Report::with('category')
            ->where('status', '!=', 'selesai')
            ->latest()
            ->take(50)
            ->get();

        if ($reports->isEmpty()) {
            return response()->json(['summary' => 'Belum ada data laporan yang bisa dirangkum.']);
        }

        $formattedData = $reports->map(function($r) {
            return "{$r->id} - {$r->category->name} - {$r->description} - {$r->severity}";
        })->implode("\n");

        $summary = $geminiAI->summarizeReports($formattedData);

        return response()->json(['summary' => $summary]);
    }
}
