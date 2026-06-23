<x-mail::message>
# Halo Warga,

Terdapat pembaruan pada laporan Anda:
**Kategori:** {{ $report->category->name ?? 'Jalan Rusak' }}
**Deskripsi:** {{ $report->description }}

## Status Terbaru: <strong style="color: #3b82f6;">{{ strtoupper($report->status) }}</strong>

Terima kasih atas kepedulian Anda terhadap infrastruktur publik!

Hormat kami,<br>
Tim {{ config('app.name') }}
</x-mail::message>
