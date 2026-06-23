import { Head, Link } from '@inertiajs/react';
import MobileLayout from '@/Layouts/MobileLayout';
import { MapPinIcon, ClockIcon, HandThumbUpIcon, CheckCircleIcon, XCircleIcon, ExclamationCircleIcon, ShareIcon, UserIcon } from '@heroicons/react/24/solid';
import { useAlert } from '@/Contexts/AlertContext';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function Feed({ reports }) {
    const { showAlert } = useAlert();
    const [localReports, setLocalReports] = useState(reports);

    useEffect(() => {
        // Sync state if props change from Inertia navigation
        setLocalReports(reports);
    }, [reports]);

    useEffect(() => {
        if (window.Echo) {
            window.Echo.channel('reports')
                .listen('.ReportCreated', (e) => {
                    setLocalReports(prev => [e.report, ...prev]);
                    // Optional: show subtle toast
                    showAlert({
                        title: 'Laporan Baru!',
                        text: 'Ada laporan jalan rusak baru di sekitarmu.',
                        icon: 'info',
                        timer: 3000,
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false
                    });
                })
                .listen('.ReportStatusChanged', (e) => {
                    setLocalReports(prev => prev.map(r => r.id === e.report.id ? e.report : r));
                });
        }
        return () => {
            if (window.Echo) {
                window.Echo.leaveChannel('reports');
            }
        };
    }, []);
    const getStatusStyle = (status) => {
        const styles = {
            'pending': { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, text: 'Menunggu' },
            'diproses': { color: 'bg-blue-100 text-blue-800', icon: ExclamationCircleIcon, text: 'Diproses' },
            'selesai': { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, text: 'Selesai' },
            'ditolak': { color: 'bg-red-100 text-red-800', icon: XCircleIcon, text: 'Ditolak' }
        };
        return styles[status] || styles['pending'];
    };

    const [filterMode, setFilterMode] = useState(new URLSearchParams(window.location.search).has('lat') ? 'terdekat' : 'terbaru');

    const handleFilterChange = (mode) => {
        if (mode === 'terbaru') {
            setFilterMode('terbaru');
            router.get('/reports/feed', {}, { preserveScroll: true });
        } else if (mode === 'terdekat') {
            if ("geolocation" in navigator) {
                showAlert({ title: 'Mencari Lokasi', text: 'Mengambil titik GPS Anda...', icon: 'info', showConfirmButton: false, timer: 1500 });
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setFilterMode('terdekat');
                        router.get('/reports/feed', { 
                            lat: position.coords.latitude, 
                            lng: position.coords.longitude 
                        }, { preserveScroll: true });
                    },
                    (error) => {
                        showAlert({ title: 'Akses Ditolak', text: 'Gagal mendapatkan lokasi. Pastikan GPS aktif.', icon: 'error' });
                    }
                );
            }
        }
    };

    return (
        <MobileLayout>
            <Head title="Linimasa Laporan" />

            <div className="bg-gray-50 min-h-screen pb-24">
                <div className="bg-white px-4 py-4 shadow-sm sticky top-0 z-20">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Linimasa Warga</h1>
                            <p className="text-xs text-gray-500">Laporan terbaru di sekitarmu</p>
                        </div>
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            <button 
                                onClick={() => handleFilterChange('terbaru')}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${filterMode === 'terbaru' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
                            >
                                Terbaru
                            </button>
                            <button 
                                onClick={() => handleFilterChange('terdekat')}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${filterMode === 'terdekat' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
                            >
                                Terdekat
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                    {localReports.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">Belum ada laporan masuk.</div>
                    ) : (
                        localReports.map((report) => {
                            const statusStyle = getStatusStyle(report.status);
                            const StatusIcon = statusStyle.icon;

                            return (
                                <Link 
                                    key={report.id} 
                                    href={`/reports/${report.id}`}
                                    className="bg-white border-y border-gray-200 p-4 active:bg-gray-50 transition"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                <UserIcon className="w-5 h-5 text-gray-500" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-gray-900">Warga Anonim</div>
                                                <div className="text-[11px] text-gray-500 flex items-center gap-1">
                                                    <ClockIcon className="w-3 h-3" />
                                                    {new Date(report.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${statusStyle.color}`}>
                                            <StatusIcon className="w-3 h-3" />
                                            {statusStyle.text}
                                        </span>
                                    </div>

                                    <div className="mt-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="font-semibold text-gray-800 text-sm">{report.category?.name}</div>
                                            {report.distance !== undefined && (
                                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                                    {report.distance < 1 ? 'Sangat Dekat (<1km)' : `${Math.round(report.distance)} KM dari sini`}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-700 line-clamp-3 mb-3">{report.description}</p>
                                        
                                        {report.photo_path && (
                                            <div className="rounded-xl overflow-hidden mb-3 max-h-60 bg-gray-100 relative">
                                                <img 
                                                    src={`/storage/${report.photo_path}`} 
                                                    alt="Bukti Laporan" 
                                                    className="w-full h-full object-cover relative z-10 transition-opacity duration-500 ease-in-out"
                                                    onLoad={(e) => {
                                                        e.target.style.opacity = 1;
                                                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'none';
                                                    }}
                                                    style={{ opacity: 0 }}
                                                />
                                                {/* Skeleton Loader */}
                                                <div className="absolute inset-0 bg-gray-200 animate-pulse z-0 flex items-center justify-center">
                                                    <div className="w-10 h-10 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-1">
                                        <div className="flex items-center text-gray-500 gap-4">
                                            <div className="flex items-center gap-1.5 text-sm hover:text-blue-600 transition">
                                                <HandThumbUpIcon className={`w-5 h-5 ${report.upvotes_count > 0 ? 'text-blue-500' : ''}`} />
                                                <span className={report.upvotes_count > 0 ? 'text-blue-600 font-bold' : ''}>
                                                    {report.upvotes_count || 0}
                                                </span>
                                            </div>
                                            <button 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (navigator.share) {
                                                        navigator.share({
                                                            title: 'Lapor Jalan Rusak',
                                                            text: `Bantu upvote laporan jalan rusak: "${report.description}"`,
                                                            url: `${window.location.origin}/reports/${report.id}`
                                                        }).catch(console.error);
                                                    } else {
                                                        navigator.clipboard.writeText(`${window.location.origin}/reports/${report.id}`);
                                                        showAlert({ title: 'Tersalin', text: 'Tautan disalin ke clipboard!', icon: 'success', timer: 1500, showConfirmButton: false });
                                                    }
                                                }}
                                                className="flex items-center gap-1.5 text-sm hover:text-green-600 transition"
                                            >
                                                <ShareIcon className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    showAlert({
                                                        title: 'Laporkan Konten?',
                                                        text: 'Apakah laporan ini mengandung unsur pornografi, SARA, atau spam?',
                                                        icon: 'warning',
                                                        showCancelButton: true,
                                                        confirmButtonColor: '#d33',
                                                        confirmButtonText: 'Ya, Laporkan!',
                                                        cancelButtonText: 'Batal'
                                                    }).then(async (result) => {
                                                        if (result.isConfirmed) {
                                                            try {
                                                                let deviceId = localStorage.getItem('lapor_jalan_device_id');
                                                                if (!deviceId) {
                                                                    deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
                                                                    localStorage.setItem('lapor_jalan_device_id', deviceId);
                                                                }
                                                                await axios.post(`/reports/${report.id}/flag`, { device_id: deviceId });
                                                                showAlert({ title: 'Berhasil', text: 'Laporan telah ditandai untuk ditinjau.', icon: 'success' }).then(() => window.location.reload());
                                                            } catch (err) {
                                                                showAlert({ title: 'Gagal', text: err.response?.data?.message || 'Gagal melaporkan', icon: 'error' });
                                                            }
                                                        }
                                                    });
                                                }}
                                                className="flex items-center gap-1.5 text-sm hover:text-red-600 transition"
                                                title="Laporkan Konten Tidak Pantas"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a15.26 15.26 0 0 1 9.46 0l2.77.693M3 15V4.5M3 4.5 5.77 3.807a15.26 15.26 0 0 1 9.46 0L18 4.5m0 0v10.5m-15 0v-10.5" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="text-xs font-medium text-primary">Lihat Detail →</div>
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>
            </div>
        </MobileLayout>
    );
}
