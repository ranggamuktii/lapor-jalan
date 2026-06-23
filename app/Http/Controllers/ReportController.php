<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Report;
use App\Models\Category;
use App\Models\Reporter;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Events\ReportCreated;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        // For admin or authenticated users
        $query = Report::with('category')->where('flags_count', '<', 3);
        
        $lat = $request->input('lat');
        $lng = $request->input('lng');

        if ($lat && $lng) {
            $haversine = "(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude))))";
            $query->select('*')
                  ->selectRaw("{$haversine} AS distance", [$lat, $lng, $lat])
                  ->orderBy('distance', 'asc');
        } else {
            $query->latest();
        }

        $reports = $query->get();
        
        if (request()->wantsJson()) {
            return response()->json($reports);
        }

        return Inertia::render('Reports/Feed', [
            'reports' => $reports
        ]);
    }

    public function history(Request $request)
    {
        $ids = $request->input('ids', []);
        $reports = Report::with('category')->whereIn('id', $ids)->latest()->get();

        if ($request->wantsJson()) {
            return response()->json($reports);
        }

        return Inertia::render('Reports/History', [
            'reports' => $reports
        ]);
    }

    public function leaderboard(Request $request)
    {
        $topReporters = Reporter::orderByDesc('xp')->take(10)->get();
        
        $deviceId = $request->input('device_id');
        $currentUser = null;
        if ($deviceId) {
            $currentUser = Reporter::where('device_id', $deviceId)->first();
            if ($currentUser) {
                // Get rank
                $rank = Reporter::where('xp', '>', $currentUser->xp)->count() + 1;
                $currentUser->rank = $rank;
            }
        }

        if ($request->wantsJson()) {
            return response()->json([
                'leaderboard' => $topReporters,
                'current_user' => $currentUser
            ]);
        }

        return Inertia::render('Reports/Leaderboard', [
            'leaderboard' => $topReporters,
            'current_user' => $currentUser
        ]);
    }

    public function show(Report $report)
    {
        $report->load(['category', 'histories']);
        
        // TAHAP 3: Load duplicate context if any
        $report->load('duplicates');

        if (request()->wantsJson()) {
            return response()->json($report);
        }

        return Inertia::render('Reports/Show', [
            'report' => $report
        ]);
    }

    public function store(Request $request, \App\Services\GeminiAI $geminiAI)
    {
        // Honeypot check for bots bypassing frontend
        if ($request->filled('website_url')) {
            abort(403, 'Spam detected.');
        }

        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'title' => 'nullable|string|max:255',
            'description' => 'required|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'photo' => 'required|image|mimes:jpeg,png,jpg|max:5120', // Max 5MB
            'reporter_email' => 'nullable|email|max:255',
        ]);

        $photoPath = $request->file('photo')->store('reports', 'public');
        
        // --- TAHAP 3: DETEKSI DUPLIKASI SPASIAL ---
        // Cari laporan aktif dalam radius ~50 meter menggunakan Haversine Formula
        $radiusKm = 0.05; // 50 meter
        $haversine = "(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude))))";
        
        $duplicateReport = Report::select('*')
            ->selectRaw("{$haversine} AS distance", [$validated['latitude'], $validated['longitude'], $validated['latitude']])
            ->whereIn('status', ['pending', 'validated', 'diproses'])
            ->whereRaw("{$haversine} < ?", [$validated['latitude'], $validated['longitude'], $validated['latitude'], $radiusKm])
            ->orderByRaw("distance ASC")
            ->first();

        // --- TAHAP 3: GEMINI VISION AI ---
        $aiResult = $geminiAI->analyzeReport($photoPath, $validated['description']);

        $deviceId = $request->input('device_id', md5($request->ip() . $request->userAgent()));

        $report = Report::create([
            'user_id' => Auth::check() ? Auth::id() : null,
            'category_id' => $validated['category_id'],
            'title' => $validated['title'] ?? '',
            'description' => $validated['description'],
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'photo_path' => $photoPath,
            'reporter_name' => 'Warga Anonim',
            'reporter_phone' => '-',
            'reporter_email' => $validated['reporter_email'] ?? null,
            'device_id' => $deviceId,
            'status' => 'pending',
            'upvotes_count' => $duplicateReport ? 0 : 1, // Jika duplicate, tidak dihitung sbg main report
            'severity' => $aiResult['severity'] ?? 'belum_dinilai',
            'ai_tags' => $aiResult['tags'] ?? null,
            'is_duplicate_of' => $duplicateReport ? $duplicateReport->id : null,
        ]);

        // Jika duplikat, tambahkan upvote ke laporan asli
        if ($duplicateReport) {
            $duplicateReport->increment('upvotes_count');
            
            $report->histories()->create([
                'new_status' => 'pending',
                'notes' => 'Laporan otomatis ditandai sebagai duplikat dari laporan #' . $duplicateReport->id,
            ]);
        } else {
            $report->histories()->create([
                'new_status' => 'pending',
                'notes' => 'Laporan berhasil dibuat',
            ]);
        }
        
        if ($request->wantsJson()) {
            // TAHAP 5: Broadcast new report to everyone
            if (!$duplicateReport) {
                broadcast(new ReportCreated($report))->toOthers();
            }

            return response()->json([
                'message' => $duplicateReport ? 'Laporan ditambahkan sebagai pendukung laporan yang sudah ada di lokasi ini.' : 'Laporan berhasil dibuat', 
                'report' => $report,
                'is_duplicate' => $duplicateReport ? true : false
            ], 201);
        }

        $flashMessage = $duplicateReport ? 'Laporan Anda ditambahkan sebagai pendukung (upvote) laporan yang sudah ada di lokasi ini!' : 'Laporan berhasil dikirim!';
        return redirect()->route('welcome')->with('success', $flashMessage);
    }

    public function upvote(Request $request, Report $report)
    {
        $deviceId = $request->input('device_id', md5($request->ip() . $request->userAgent()));
        $ipAddress = $request->ip();

        // Check if already upvoted by this IP/Device in original table
        $exists = $report->upvotes()
            ->where(function($query) use ($ipAddress, $deviceId) {
                if ($ipAddress) $query->where('ip_address', $ipAddress);
                if ($deviceId) $query->orWhere('device_id', $deviceId);
            })
            ->exists();

        // PHASE 3: Check report_confirmations
        $confirmed = \Illuminate\Support\Facades\DB::table('report_confirmations')
            ->where('report_id', $report->id)
            ->where('device_hash', $deviceId)
            ->exists();

        if ($exists || $confirmed) {
            return response()->json(['message' => 'Anda sudah mengonfirmasi laporan ini.'], 422);
        }

        // Legacy compatibility
        $report->upvotes()->create([
            'ip_address' => $ipAddress,
            'device_id' => $deviceId,
        ]);

        // Phase 3 table
        \Illuminate\Support\Facades\DB::table('report_confirmations')->insert([
            'report_id' => $report->id,
            'device_hash' => $deviceId,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $report->increment('upvotes_count');
        
        if ($report->upvotes_count >= 5 && $report->status === 'pending') {
            $report->update(['status' => 'validated']);
            
            $report->histories()->create([
                'old_status' => 'pending',
                'new_status' => 'validated',
                'notes' => 'Tervalidasi otomatis oleh komunitas (5+ upvotes)',
            ]);
            
            broadcast(new ReportStatusChanged($report))->toOthers();
        }
        
        return response()->json([
            'message' => 'Konfirmasi berhasil dicatat.',
            'upvotes_count' => $report->upvotes_count
        ]);
    }

    public function flag(Request $request, Report $report)
    {
        $deviceId = $request->input('device_id');
        $ipAddress = $request->ip();

        // Check if already flagged by this IP/Device
        $exists = $report->flags()
            ->where(function($query) use ($ipAddress, $deviceId) {
                if ($ipAddress) $query->where('ip_address', $ipAddress);
                if ($deviceId) $query->orWhere('device_id', $deviceId);
            })
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Anda sudah melaporkan konten ini.'], 422);
        }

        $report->flags()->create([
            'ip_address' => $ipAddress,
            'device_id' => $deviceId,
        ]);

        $report->increment('flags_count');

        return response()->json([
            'message' => 'Laporan berhasil dicatat. Terima kasih.',
            'flags_count' => $report->flags_count
        ]);
    }
}
