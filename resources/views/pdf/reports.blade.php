<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Resmi</title>
    <style>
        body { font-family: sans-serif; font-size: 14px; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
        .title { font-size: 18px; font-weight: bold; text-transform: uppercase; margin: 0; }
        .subtitle { font-size: 12px; color: #555; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .stats-box { margin-bottom: 20px; padding: 10px; background-color: #f9f9f9; border: 1px solid #ddd; }
        .footer { margin-top: 50px; text-align: right; font-size: 12px; }
        .signature { margin-top: 60px; }
    </style>
</head>
<body>

    <div class="header">
        <p class="title">PEMERINTAH KOTA BANDUNG</p>
        <p class="subtitle">DINAS PEKERJAAN UMUM</p>
        <p class="subtitle">Sistem Pelaporan Infrastruktur Terpadu (Lapor Jalan)</p>
    </div>

    <h2 style="text-align: center; font-size: 16px; margin-bottom: 20px;">Laporan Rekapitulasi Kerusakan Infrastruktur</h2>

    <div class="stats-box">
        <strong>Ringkasan Statistik:</strong>
        <ul style="margin: 5px 0 0 0; padding-left: 20px;">
            <li>Total Laporan Masuk: {{ $totalReports }}</li>
            <li>Laporan Diselesaikan: {{ $totalSelesai }}</li>
            <li>Rasio Penyelesaian: {{ $totalReports > 0 ? round(($totalSelesai / $totalReports) * 100) : 0 }}%</li>
        </ul>
    </div>

    <h3>Distribusi Kategori</h3>
    <table>
        <thead>
            <tr>
                <th>Kategori</th>
                <th>Jumlah Laporan</th>
            </tr>
        </thead>
        <tbody>
            @foreach($categories as $category)
            <tr>
                <td>{{ $category->name }}</td>
                <td>{{ $category->reports_count }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <h3>20 Laporan Terbaru</h3>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Tanggal</th>
                <th>Kategori</th>
                <th>Status</th>
                <th>Deskripsi Singkat</th>
            </tr>
        </thead>
        <tbody>
            @foreach($recentReports as $report)
            <tr>
                <td>#{{ $report->id }}</td>
                <td>{{ $report->created_at->format('d M Y') }}</td>
                <td>{{ $report->category->name }}</td>
                <td>{{ strtoupper($report->status) }}</td>
                <td>{{ Str::limit($report->description, 50) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>Bandung, {{ date('d F Y') }}</p>
        <p>Admin Lapor Jalan</p>
        <div class="signature">
            <p>_______________________</p>
            <p>NIP. -</p>
        </div>
    </div>

</body>
</html>
