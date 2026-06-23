<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Jalan</title>
    <style>
        @page { margin: 40px; }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 10pt;
            color: #334155;
            background-color: #f8fafc;
        }
        
        /* DOMPDF Hack: Full width top border */
        .top-accent {
            position: absolute;
            top: -40px;
            left: -40px;
            width: 300px;
            height: 12px;
            background-color: #1d4ed8;
            border-bottom-right-radius: 15px;
        }

        /* HEADER */
        .header-table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 30px; }
        .header-table td { vertical-align: middle; padding: 0; }
        .logo-img { width: 60px; border-radius: 12px; }
        .brand-title { font-size: 26pt; font-weight: bold; color: #0f172a; margin: 0; letter-spacing: -1px; line-height: 1; }
        .brand-subtitle { font-size: 11pt; color: #64748b; margin: 5px 0 0 0; }
        
        .date-box { text-align: right; }
        .date-icon { border: 1.5px solid #94a3b8; border-radius: 4px; color: #94a3b8; font-size: 10pt; font-weight: bold; padding: 2px 5px; margin-right: 5px; }
        .date-label { font-size: 7.5pt; font-weight: bold; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
        .date-value { font-size: 10pt; font-weight: bold; color: #1e293b; margin-top: 4px; display: block; }

        /* CARDS */
        .card-wrapper {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
        }

        /* STATS GRID */
        .stats-grid { width: 100%; border-collapse: collapse; margin-bottom: 25px; table-layout: fixed; }
        .stats-grid td { vertical-align: top; }
        .stat-card-inner { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; }
        
        .stat-icon-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .stat-icon-box { width: 40px; height: 40px; border-radius: 50%; text-align: center; vertical-align: middle; font-size: 16pt; font-weight: bold; }
        .icon-blue { background: #eff6ff; color: #0f172a; border: 1px solid #bfdbfe; }
        .icon-green { background: #f0fdf4; color: #0f172a; border: 1px solid #bbf7d0; }
        .icon-purple { background: #faf5ff; color: #0f172a; border: 1px solid #c7d2fe; }

        .stat-label { font-size: 7.5pt; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; text-align: right; vertical-align: middle; }
        .stat-value { font-size: 32pt; font-weight: bold; color: #0f172a; line-height: 1; margin: 0; padding: 0; display: block; text-align: center; }
        .stat-value.blue { color: #1d4ed8; }
        .stat-value.green { color: #15803d; }
        .stat-desc { font-size: 8pt; color: #94a3b8; margin-top: 10px; display: block; text-align: center; }

        /* SECTION TITLES */
        .section-title { font-size: 11pt; font-weight: bold; color: #0f172a; margin-bottom: 20px; text-transform: uppercase; }
        .section-icon { background: #eff6ff; color: #1d4ed8; border-radius: 4px; padding: 2px 6px; margin-right: 8px; font-size: 12pt; }

        /* BAR CHART */
        @php
            $maxReports = $categories->max('reports_count') ?: 1;
        @endphp
        .bar-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        .bar-table td { padding: 8px 0; vertical-align: middle; }
        .bar-label { font-size: 9pt; font-weight: bold; color: #334155; }
        .bar-track { background: #f1f5f9; height: 16px; border-radius: 8px; width: 100%; position: relative; }
        .bar-fill { background: #3b82f6; height: 16px; border-radius: 8px; }
        .bar-num { font-size: 11pt; font-weight: bold; color: #0f172a; text-align: right; display: block; }
        .bar-cases { font-size: 7.5pt; color: #94a3b8; display: block; text-align: right; margin-top: -2px; }

        /* DATA TABLE */
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th { border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 7.5pt; font-weight: bold; text-transform: uppercase; padding: 12px 10px; text-align: left; background: #f8fafc; }
        .data-table td { border-bottom: 1px solid #f1f5f9; padding: 15px 10px; font-size: 9pt; color: #475569; vertical-align: middle; }
        .data-table tr:last-child td { border-bottom: none; }
        
        .id-col { font-weight: bold; color: #1e293b; font-size: 10pt; }
        .date-col { font-size: 8.5pt; font-weight: bold; color: #0f172a; display: block; }
        .time-col { font-size: 7.5pt; color: #94a3b8; display: block; margin-top: 2px; }
        .cat-col { font-weight: bold; color: #1e293b; }
        .dot { color: #3b82f6; font-size: 16pt; line-height: 0; vertical-align: middle; margin-right: 5px; }
        .desc-col { font-size: 9pt; color: #64748b; line-height: 1.4; }
        
        /* BADGES */
        .badge { padding: 4px 8px; font-size: 7pt; font-weight: bold; text-transform: uppercase; border-radius: 6px; display: inline-block; text-align: center; }
        .badge.pending { border: 1px solid #f59e0b; color: #f59e0b; background: #fffbeb; }
        .badge.diproses { border: 1px solid #3b82f6; color: #3b82f6; background: #eff6ff; }
        .badge.selesai { border: 1px solid #22c55e; color: #22c55e; background: #f0fdf4; }
        .badge.ditolak { border: 1px solid #ef4444; color: #ef4444; background: #fef2f2; }

        /* FOOTER MSG */
        .footer-msg { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px; text-align: center; font-size: 9pt; color: #1d4ed8; font-weight: bold; margin-top: 15px; }

        /* PAGE FOOTER */
        .page-footer { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; width: 100%; border-collapse: collapse; }
        .page-footer td { vertical-align: middle; padding: 0; }
        .footer-text { font-size: 8pt; color: #94a3b8; margin: 0; line-height: 1.4; }
    </style>
</head>
<body>

    <div class="top-accent"></div>

    <!-- HEADER -->
    <table class="header-table">
        <tr>
            <td width="75">
                <img src="{{ public_path('logo-black.png') }}" class="logo-img" alt="Logo">
            </td>
            <td>
                <h1 class="brand-title">LAPOR JALAN</h1>
                <p class="brand-subtitle">Ringkasan Laporan Pengaduan Jalan</p>
            </td>
            <td class="date-box" width="180">
                <span class="date-label">DATA TINJAUAN</span>
                <span class="date-value">{{ date('d M Y, H:i') }}</span>
            </td>
        </tr>
    </table>

    <!-- STATS GRID -->
    <table class="stats-grid">
        <tr>
            <!-- Card 1 -->
            <td width="32%">
                <div class="stat-card-inner">
                    <div class="stat-label" style="text-align: center; margin-bottom: 10px;">TOTAL KASUS</div>
                    <span class="stat-value blue">{{ $totalReports }}</span>
                    <span class="stat-desc">Semua laporan masuk</span>
                </div>
            </td>
            <td width="2%"></td>
            <!-- Card 2 -->
            <td width="32%">
                <div class="stat-card-inner">
                    <div class="stat-label" style="text-align: center; margin-bottom: 10px;">DIKERJAKAN</div>
                    <span class="stat-value green">{{ $totalSelesai }}</span>
                    <span class="stat-desc">Sedang diproses</span>
                </div>
            </td>
            <td width="2%"></td>
            <!-- Card 3 -->
            <td width="32%">
                <div class="stat-card-inner">
                    <div class="stat-label" style="text-align: center; margin-bottom: 10px;">PERSENTASE</div>
                    <span class="stat-value blue">{{ $totalReports > 0 ? round(($totalSelesai / $totalReports) * 100) : 0 }}%</span>
                    <span class="stat-desc">Tingkat penyelesaian</span>
                </div>
            </td>
        </tr>
    </table>

    <!-- BAR CHART SECTION -->
    <div class="card-wrapper" style="margin-bottom: 25px;">
        <div class="section-title">
            ANALISIS KATEGORI KERUSAKAN
        </div>
        
        <table class="bar-table">
            @foreach($categories as $category)
            <tr>
                <td width="25%" class="bar-label">{{ $category->name }}</td>
                <td width="65%">
                    <div class="bar-track">
                        <div class="bar-fill" style="width: {{ ($category->reports_count / $maxReports) * 100 }}%;"></div>
                    </div>
                </td>
                <td width="10%" align="right">
                    <span class="bar-num">{{ $category->reports_count }}</span>
                    <span class="bar-cases">kasus</span>
                </td>
            </tr>
            @endforeach
        </table>
    </div>

    <!-- TABLE SECTION -->
    <div class="card-wrapper">
        <div class="section-title">
            AKTIVITAS LAPORAN TERBARU
        </div>
        
        <table class="data-table">
            <thead>
                <tr>
                    <th width="12%">ID</th>
                    <th width="18%">TANGGAL</th>
                    <th width="20%">KATEGORI</th>
                    <th width="35%">DESKRIPSI SINGKAT</th>
                    <th width="15%" style="text-align: right;">STATUS</th>
                </tr>
            </thead>
            <tbody>
                @foreach($recentReports as $report)
                <tr>
                    <td class="id-col">#{{ str_pad($report->id, 4, '0', STR_PAD_LEFT) }}</td>
                    <td>
                        <span class="date-col">{{ $report->created_at->format('d/m/Y') }}</span>
                        <span class="time-col">{{ $report->created_at->format('H:i') }} WIB</span>
                    </td>
                    <td class="cat-col">
                        <span class="dot">&bull;</span> {{ $report->category->name }}
                    </td>
                    <td class="desc-col">{{ Str::limit($report->description, 45) }}</td>
                    <td align="right">
                        @php
                            $badgeClass = 'pending';
                            if ($report->status == 'diproses') $badgeClass = 'diproses';
                            if ($report->status == 'selesai') $badgeClass = 'selesai';
                            if ($report->status == 'ditolak') $badgeClass = 'ditolak';
                        @endphp
                        <span class="badge {{ $badgeClass }}">{{ strtoupper($report->status) }}</span>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="footer-msg">
            ( i ) Terima kasih telah berpartisipasi menjaga infrastruktur jalan yang lebih baik.
        </div>
    </div>

    <!-- FOOTER -->
    <table class="page-footer">
        <tr>
            <td width="35">
                <img src="{{ public_path('logo-black.png') }}" alt="Logo" style="width: 20px; opacity: 0.5;">
            </td>
            <td>
                <p class="footer-text">Laporan ini digenerate secara otomatis.<br>
                © {{ date('Y') }} Lapor Jalan - Sistem Terpadu</p>
            </td>
        </tr>
    </table>

</body>
</html>
