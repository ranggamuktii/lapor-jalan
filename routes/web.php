<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    $recentReports = \App\Models\Report::with('category')
        ->where('flags_count', '<', 3)
        ->latest()
        ->take(3)
        ->get();
    
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'recentReports' => $recentReports
    ]);
})->name('welcome');

Route::get('/dashboard', function () {
    if (auth()->check() && auth()->user()->role === 'admin') {
        return redirect()->route('admin.reports.index');
    }
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Admin routes
    Route::middleware([\App\Http\Middleware\IsAdmin::class])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/reports', [\App\Http\Controllers\Admin\ReportController::class, 'index'])->name('reports.index');
        Route::get('/analytics', [\App\Http\Controllers\Admin\AnalyticsController::class, 'index'])->name('analytics.index');
        Route::get('/analytics/export-pdf', [\App\Http\Controllers\Admin\AnalyticsController::class, 'exportPdf'])->name('analytics.export-pdf');
        Route::patch('/reports/{report}/validate', [\App\Http\Controllers\Admin\ReportController::class, 'validateReport'])->name('reports.validate');
        Route::patch('/reports/{report}/process', [\App\Http\Controllers\Admin\ReportController::class, 'process'])->name('reports.process');
        Route::patch('/reports/{report}/reject', [\App\Http\Controllers\Admin\ReportController::class, 'reject'])->name('reports.reject');
        Route::patch('/reports/{report}/resolve', [\App\Http\Controllers\Admin\ReportController::class, 'resolve'])->name('reports.resolve');
        Route::get('/reports/summarize', [\App\Http\Controllers\Admin\ReportController::class, 'summarize'])->name('reports.summarize');
    });
});

// Warga routes (Public)
Route::get('/reports', [\App\Http\Controllers\ReportController::class, 'index'])->name('reports.index');
Route::get('/reports/create', function () {
    return Inertia::render('Reports/Create', [
        'categories' => \App\Models\Category::all()
    ]);
})->name('reports.create');
Route::post('/reports', [\App\Http\Controllers\ReportController::class, 'store'])->name('reports.store')->middleware('throttle:reports');
Route::get('/reports/map', function () {
    return Inertia::render('Reports/Map', [
        'reports' => \App\Models\Report::with('category')->latest()->get()
    ]);
})->name('reports.map');

Route::get('/reports/feed', [ReportController::class, 'index'])->name('reports.feed');
Route::get('/reports/history', [ReportController::class, 'history'])->name('reports.history');
Route::get('/reports/{report}', [ReportController::class, 'show'])->name('reports.show');
Route::post('/reports/{report}/upvote', [\App\Http\Controllers\ReportController::class, 'upvote'])->name('reports.upvote');

require __DIR__.'/auth.php';
