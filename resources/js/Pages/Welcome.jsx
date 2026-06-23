import { Head, Link } from '@inertiajs/react';
import MobileLayout from '@/Layouts/MobileLayout';
import { CameraIcon, MapIcon, ChatBubbleLeftRightIcon, TrophyIcon, ChevronRightIcon, MapPinIcon } from '@heroicons/react/24/solid';

export default function Welcome({ recentReports = [] }) {
    return (
        <MobileLayout>
            <Head title="Beranda" />
            
            {/* Header Area */}
            <div className="bg-primary px-5 pt-8 pb-20 rounded-b-[40px] shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                
                <div className="flex justify-between items-center relative z-10">
                    <div>
                        <p className="text-blue-100 text-xs font-medium mb-1">Selamat datang di</p>
                        <h1 className="text-2xl font-black text-white tracking-tight">Lapor Jalan</h1>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm p-1.5 shadow-sm border border-white/30">
                        <img src="/app-logo.png" alt="Lapor Jalan Logo" className="w-full h-full object-contain drop-shadow-md" />
                    </div>
                </div>
            </div>

            <div className="px-5 -mt-12 relative z-20 pb-24">
                
                {/* Hero Banner CTA */}
                <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-5 mb-6 flex items-center justify-between border border-gray-100">
                    <div className="flex-1 pr-4">
                        <h2 className="text-base font-extrabold text-gray-900 mb-1">Ada fasilitas rusak?</h2>
                        <p className="text-xs text-gray-500 leading-snug mb-3">Bantu laporkan agar segera ditindaklanjuti oleh dinas terkait.</p>
                        <Link href={route('reports.create')} className="inline-block bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg shadow-md shadow-blue-500/30 hover:bg-blue-700 transition">
                            Lapor Sekarang
                        </Link>
                    </div>
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                        <CameraIcon className="w-10 h-10 text-primary" />
                    </div>
                </div>

                {/* Quick Menu Grid */}
                <h3 className="text-sm font-extrabold text-gray-900 mb-3 px-1">Menu Utama</h3>
                <div className="grid grid-cols-4 gap-3 mb-8">
                    <Link href={route('reports.create')} className="flex flex-col items-center">
                        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-2 shadow-sm border border-red-100 active:scale-95 transition">
                            <CameraIcon className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-700 text-center">Buat<br/>Laporan</span>
                    </Link>
                    <Link href={route('reports.map')} className="flex flex-col items-center">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mb-2 shadow-sm border border-blue-100 active:scale-95 transition">
                            <MapIcon className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-700 text-center">Peta<br/>Lokasi</span>
                    </Link>
                    <Link href={route('reports.feed')} className="flex flex-col items-center">
                        <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-500 mb-2 shadow-sm border border-green-100 active:scale-95 transition">
                            <ChatBubbleLeftRightIcon className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-700 text-center">Linimasa<br/>Warga</span>
                    </Link>
                    <Link href={route('reports.history')} className="flex flex-col items-center">
                        <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mb-2 shadow-sm border border-amber-100 active:scale-95 transition">
                            <TrophyIcon className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-700 text-center">Riwayat &<br/>Gelar</span>
                    </Link>
                </div>

                {/* Recent Reports */}
                <div className="flex justify-between items-end mb-4 px-1">
                    <h3 className="text-sm font-extrabold text-gray-900">Laporan Terbaru</h3>
                    <Link href={route('reports.feed')} className="text-[10px] font-bold text-primary flex items-center">
                        Lihat Semua <ChevronRightIcon className="w-3 h-3 ml-0.5" />
                    </Link>
                </div>
                
                <div className="space-y-3">
                    {recentReports.length > 0 ? recentReports.map(report => (
                        <Link key={report.id} href={`/reports/${report.id}`} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-3 items-center active:scale-[0.98] transition">
                            {report.photo_path ? (
                                <img src={`/storage/${report.photo_path}`} className="w-16 h-16 rounded-xl object-cover" />
                            ) : (
                                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                                    <CameraIcon className="w-6 h-6 text-gray-300" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-black text-primary uppercase tracking-wider mb-0.5">{report.category?.name}</div>
                                <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight mb-1">{report.description}</p>
                                <div className="text-[9px] font-medium text-gray-400">{new Date(report.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' })}</div>
                            </div>
                        </Link>
                    )) : (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                            <p className="text-xs text-gray-500 font-medium">Belum ada laporan masuk hari ini.</p>
                        </div>
                    )}
                </div>

            </div>
        </MobileLayout>
    );
}
