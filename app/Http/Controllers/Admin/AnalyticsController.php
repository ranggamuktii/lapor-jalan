<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Report;
use App\Models\Category;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class AnalyticsController extends Controller
{
    public function index()
    {
        // Global Stats
        $totalReports = Report::count();
        $totalSelesai = Report::where('status', 'selesai')->count();
        $totalDiproses = Report::whereIn('status', ['diproses', 'validated'])->count();
        $totalDitolak = Report::where('status', 'ditolak')->count();

        // Category Stats
        $categories = Category::withCount('reports')->get()->map(function ($cat) use ($totalReports) {
            $percentage = $totalReports > 0 ? round(($cat->reports_count / $totalReports) * 100) : 0;
            return [
                'name' => $cat->name,
                'count' => $cat->reports_count,
                'percentage' => $percentage
            ];
        });

        // Area Stats (Mocked by grouping rounded lat/lng as we don't have reverse geocoded districts in DB)
        // Since it's Phase 3, we can just group by a rough coordinate to simulate regions.
        $areaStats = Report::select(
            DB::raw('ROUND(latitude, 2) as lat_group'),
            DB::raw('ROUND(longitude, 2) as lng_group'),
            DB::raw('count(*) as report_count'),
            DB::raw('SUM(CASE WHEN status = "selesai" THEN 1 ELSE 0 END) as resolved_count'),
            DB::raw('SUM(CASE WHEN status IN ("diproses", "validated") THEN 1 ELSE 0 END) as processing_count')
        )
        ->groupBy('lat_group', 'lng_group')
        ->orderBy('report_count', 'desc')
        ->take(5)
        ->get()
        ->map(function ($area) {
            // Give them dummy names based on coords since we don't store actual district names yet
            return [
                'district_name' => "Area (" . $area->lat_group . ", " . $area->lng_group . ")",
                'report_count' => $area->report_count,
                'resolved_count' => $area->resolved_count,
                'processing_count' => $area->processing_count,
            ];
        });

        // Fetch Weekly AI Summary
        $aiService = new \App\Services\AiService();
        $summary = $aiService->generateWeeklySummary([
            'total_reports' => $totalReports,
            'top_category' => $categories->sortByDesc('count')->first()['name'] ?? '-',
            'top_district' => $areaStats->first()['district_name'] ?? '-',
        ]);

        // Weekly Trend Data (Last 7 Days)
        $weeklyTrend = collect(range(6, 0))->map(function ($daysAgo) {
            $date = Carbon::now()->subDays($daysAgo)->format('Y-m-d');
            return [
                'date' => Carbon::parse($date)->format('d M'),
                'count' => Report::whereDate('created_at', $date)->count()
            ];
        });

        return Inertia::render('Admin/Analytics/Index', [
            'stats' => [
                'total' => $totalReports,
                'selesai' => $totalSelesai,
                'diproses' => $totalDiproses,
                'ditolak' => $totalDitolak,
            ],
            'categories' => $categories,
            'areas' => $areaStats,
            'weekly_trend' => $weeklyTrend,
            'ai_summary' => $summary,
            'heatmap_data' => Report::select('latitude', 'longitude', 'status')->get()
        ]);
    }

    public function exportPdf()
    {
        // Data for PDF
        $totalReports = Report::count();
        $totalSelesai = Report::where('status', 'selesai')->count();
        $categories = Category::withCount('reports')->get();
        $recentReports = Report::with('category')->latest()->take(20)->get();

        $pdf = Pdf::loadView('pdf.reports', compact('totalReports', 'totalSelesai', 'categories', 'recentReports'));
        
        return $pdf->download('Laporan_Resmi_Jalan_Rusak_' . date('Y-m-d') . '.pdf');
    }
}
