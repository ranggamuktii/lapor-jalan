<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

echo "Mulai UAT Otomatis Lapor Jalan...\n\n";

// Test 1: Buka Landing Page
$request = Illuminate\Http\Request::create('/', 'GET');
$response = $kernel->handle($request);
echo "Test 1 (Landing Page): " . ($response->status() == 200 ? "LULUS" : "GAGAL") . "\n";

// Test 2: Buka halaman lapor
$request = Illuminate\Http\Request::create('/reports/create', 'GET');
$response = $kernel->handle($request);
echo "Test 2 (Halaman Create): " . ($response->status() == 200 ? "LULUS" : "GAGAL") . "\n";

// Test 3: Submit Kosong (Validasi)
$request = Illuminate\Http\Request::create('/reports', 'POST', [], [], [], ['HTTP_ACCEPT' => 'application/json']);
$response = $kernel->handle($request);
$content = json_decode($response->getContent(), true);
$hasErrors = isset($content['errors']) && isset($content['errors']['reporter_name']) && isset($content['errors']['photo']);
echo "Test 3 (Validasi Kosong): " . ($response->status() == 422 && $hasErrors ? "LULUS" : "GAGAL") . "\n";

// Test 4: Submit Valid Guest Report
$file = \Illuminate\Http\UploadedFile::fake()->image('bukti.jpg');
$request = Illuminate\Http\Request::create('/reports', 'POST', [
    'reporter_name' => 'Budi Warga',
    'reporter_phone' => '081234567890',
    'category_id' => 1,
    'description' => 'Jalan rusak parah',
    'latitude' => '-6.406',
    'longitude' => '107.454'
], [], ['photo' => $file], ['HTTP_ACCEPT' => 'application/json']);

$response = $kernel->handle($request);
$reportData = json_decode($response->getContent(), true);
echo "Test 4 (Submit Laporan): " . ($response->status() == 201 ? "LULUS" : "GAGAL (" . $response->getContent() . ")") . "\n";
$reportId = $reportData['report']['id'] ?? null;

// Test 5: History endpoint
if ($reportId) {
    $request = Illuminate\Http\Request::create('/reports/history', 'GET', ['ids' => [$reportId]], [], [], ['HTTP_ACCEPT' => 'application/json']);
    $response = $kernel->handle($request);
    $historyData = json_decode($response->getContent(), true);
    echo "Test 5 (History dengan ID di LocalStorage): " . (count($historyData) == 1 ? "LULUS" : "GAGAL") . "\n";
} else {
    echo "Test 5 (History): GAGAL (Report ID tidak ditemukan)\n";
}

// Test 6: Akses Admin tanpa login (Harus ditolak)
$request = Illuminate\Http\Request::create('/admin/reports', 'GET');
$response = $kernel->handle($request);
echo "Test 6 (Akses Admin Guest): " . ($response->status() == 302 || $response->status() == 401 ? "LULUS" : "GAGAL") . "\n";

// Test 7: Admin Action (Process)
if ($reportId) {
    // Login as admin
    $admin = \App\Models\User::where('role', 'admin')->first();
    auth()->login($admin);
    
    $request = Illuminate\Http\Request::create("/admin/reports/{$reportId}/process", 'PATCH');
    $response = $kernel->handle($request);
    
    $report = \App\Models\Report::find($reportId);
    echo "Test 7 (Admin Validasi/Process): " . ($report->status == 'diproses' ? "LULUS" : "GAGAL") . "\n";
} else {
    echo "Test 7 (Admin Action): GAGAL\n";
}

echo "\nUAT Selesai.\n";
