import { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MobileLayout from '@/Layouts/MobileLayout';
import { ArrowLeftIcon, MapPinIcon, ClockIcon, CheckCircleIcon, XCircleIcon, ExclamationCircleIcon, HandThumbUpIcon, ShareIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import { useAlert } from '@/Contexts/AlertContext';

export default function Show({ report }) {
    const { showAlert } = useAlert();
    const [upvotesCount, setUpvotesCount] = useState(report.upvotes_count || 0);
    const [upvoting, setUpvoting] = useState(false);
    const [address, setAddress] = useState("Mencari lokasi...");
    
    useEffect(() => {
        const fetchAddress = async () => {
            try {
                const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${report.latitude}&lon=${report.longitude}`);
                if (res.data && res.data.display_name) {
                    const parts = res.data.display_name.split(',');
                    const shortName = parts.slice(0, 3).join(',').trim();
                    setAddress(shortName);
                } else {
                    setAddress("Lokasi tidak diketahui");
                }
            } catch (err) {
                setAddress("Gagal memuat lokasi");
            }
        };
        fetchAddress();
    }, [report.latitude, report.longitude]);

    const getStatusStyle = (status) => {
        const styles = {
            'pending': { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, text: 'Menunggu' },
            'diproses': { color: 'bg-blue-100 text-blue-800', icon: ExclamationCircleIcon, text: 'Diproses' },
            'selesai': { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, text: 'Selesai' },
            'ditolak': { color: 'bg-red-100 text-red-800', icon: XCircleIcon, text: 'Ditolak' }
        };
        return styles[status] || styles['pending'];
    };

    const statusStyle = getStatusStyle(report.status);
    const StatusIcon = statusStyle.icon;

    const handleUpvote = async () => {
        if (upvoting) return;
        
        let deviceId = localStorage.getItem('device_id');
        if (!deviceId) {
            deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('device_id', deviceId);
        }

        setUpvoting(true);
        try {
            const response = await axios.post(`/reports/${report.id}/upvote`, { device_id: deviceId });
            setUpvotesCount(response.data.upvotes_count);
            showAlert({
                title: 'Berhasil!',
                text: 'Terima kasih atas konfirmasinya.',
                icon: 'success',
                confirmButtonColor: '#3085d6'
            });
        } catch (error) {
            if (error.response && error.response.status === 422) {
                showAlert({
                    title: 'Sudah Dikonfirmasi',
                    text: error.response.data.message || 'Anda sudah memberikan konfirmasi untuk masalah ini.',
                    icon: 'info',
                    confirmButtonColor: '#3085d6'
                });
            } else {
                showAlert({
                    title: 'Gagal',
                    text: 'Gagal melakukan konfirmasi laporan.',
                    icon: 'error',
                    confirmButtonColor: '#d33'
                });
            }
        }
        setUpvoting(false);
    };

    return (
        <MobileLayout>
            <Head title={`Detail Laporan #${report.id}`} />
            
            {/* Header / Image (Before-After if resolved) */}
            {!report.resolved_photo_path ? (
                <div className="relative w-full h-64 bg-gray-200">
                    <button onClick={() => window.history.back()} className="absolute top-4 left-4 z-50 bg-white/80 backdrop-blur p-2 rounded-full shadow-md hover:bg-white transition cursor-pointer">
                        <ArrowLeftIcon className="w-5 h-5 text-gray-800" />
                    </button>
                    {report.photo_path && report.photo_path !== 'path' ? (
                        <div className="w-full h-full relative">
                            <img 
                                src={`/storage/${report.photo_path}`} 
                                alt="Bukti Laporan" 
                                className="w-full h-full object-cover relative z-10 transition-opacity duration-500 ease-in-out"
                                onLoad={(e) => {
                                    e.target.style.opacity = 1;
                                    if(e.target.nextSibling) e.target.nextSibling.style.display = 'none';
                                }}
                                style={{ opacity: 0 }}
                            />
                            {/* Skeleton Loader */}
                            <div className="absolute inset-0 bg-gray-200 animate-pulse z-0 flex items-center justify-center">
                                <div className="w-10 h-10 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">Tidak ada foto</div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col w-full bg-gray-900 pb-4 relative">
                    <button onClick={() => window.history.back()} className="absolute top-4 left-4 z-50 bg-white/80 backdrop-blur p-2 rounded-full shadow-md hover:bg-white transition cursor-pointer">
                        <ArrowLeftIcon className="w-5 h-5 text-gray-800" />
                    </button>
                    <div className="flex">
                        <div className="w-1/2 relative h-56 border-r border-gray-700">
                            <img src={`/storage/${report.photo_path}`} className="w-full h-full object-cover opacity-80" />
                            <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded">SEBELUM</span>
                        </div>
                        <div className="w-1/2 relative h-56">
                            <img src={`/storage/${report.resolved_photo_path}`} className="w-full h-full object-cover" />
                            <span className="absolute bottom-2 left-2 bg-green-500/90 text-white text-xs font-bold px-2 py-1 rounded">SESUDAH</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className={`p-5 bg-card min-h-screen ${report.resolved_photo_path ? '' : '-mt-6'} rounded-t-3xl relative z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]`}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className="text-sm font-extrabold text-primary uppercase tracking-wider">{report.category?.name}</span>
                        <div className="text-xs font-semibold text-gray-400 mt-1">{new Date(report.created_at).toLocaleDateString('id-ID')}</div>
                    </div>
                    {/* Move Status Badge Here */}
                    <span className={`flex items-center px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${statusStyle.color}`}>
                        <StatusIcon className="w-4 h-4 mr-1.5" />
                        {statusStyle.text}
                    </span>
                </div>

                <p className="text-textmain text-lg font-medium leading-relaxed mb-6">
                    "{report.description}"
                </p>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl mb-4 relative">
                    <MapPinIcon className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex flex-col pr-8">
                        <span className="text-sm text-gray-800 font-semibold mb-1">{address}</span>
                        <span className="text-xs text-gray-500 font-mono mb-2">
                            {report.latitude}, {report.longitude}
                        </span>
                        <div className="flex gap-2">
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (navigator.share) {
                                        navigator.share({
                                            title: 'Lapor Jalan Rusak',
                                            text: `Lihat laporan ini: "${report.description}"`,
                                            url: window.location.href
                                        }).catch(console.error);
                                    } else {
                                        navigator.clipboard.writeText(window.location.href);
                                        showAlert({ title: 'Tersalin', text: 'Tautan disalin ke clipboard!', icon: 'success', timer: 1500, showConfirmButton: false });
                                    }
                                }}
                                className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-700 transition"
                                title="Bagikan Laporan"
                            >
                                <ShareIcon className="w-4 h-4" />
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
                                                showAlert({ title: 'Berhasil', text: 'Laporan telah ditandai untuk ditinjau.', icon: 'success' }).then(() => {
                                                    window.location.href = '/reports/feed';
                                                });
                                            } catch (err) {
                                                showAlert({ title: 'Gagal', text: err.response?.data?.message || 'Gagal melaporkan', icon: 'error' });
                                            }
                                        }
                                    });
                                }}
                                className="p-2 bg-red-100 hover:bg-red-200 rounded-full text-red-600 transition"
                                title="Laporkan Konten Tidak Pantas"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a15.26 15.26 0 0 1 9.46 0l2.77.693M3 15V4.5M3 4.5 5.77 3.807a15.26 15.26 0 0 1 9.46 0L18 4.5m0 0v10.5m-15 0v-10.5" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* AI Score Area (Phase 3) */}
                {report.ai_score && (
                    <div className="mb-6 p-4 border border-indigo-100 bg-indigo-50/50 rounded-2xl flex items-center justify-between">
                        <div>
                            <div className="text-[10px] font-bold uppercase text-indigo-400 flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z" clipRule="evenodd" /></svg>
                                AI Severity Score
                            </div>
                            <div className="text-xs text-indigo-700 font-medium mt-0.5 line-clamp-1">{report.ai_score.ai_summary}</div>
                        </div>
                        <div className={`text-2xl font-black ml-2 ${report.ai_score.severity_score >= 80 ? 'text-red-500' : report.ai_score.severity_score >= 50 ? 'text-orange-500' : 'text-green-500'}`}>
                            {report.ai_score.severity_score}
                        </div>
                    </div>
                )}

                {/* Upvote Area */}
                <div className="mb-8 p-4 border border-blue-100 bg-blue-50/50 rounded-2xl flex flex-col items-center justify-center">
                    <p className="text-sm font-bold text-blue-900 mb-2">{upvotesCount} warga mengonfirmasi masalah ini</p>
                    <button 
                        onClick={handleUpvote}
                        disabled={upvoting || report.status === 'selesai' || report.status === 'ditolak'}
                        className="flex items-center justify-center w-full py-3 px-4 bg-white border border-blue-200 text-blue-700 font-bold rounded-xl shadow-sm hover:bg-blue-50 active:bg-blue-100 disabled:opacity-50 transition"
                    >
                        <HandThumbUpIcon className="w-5 h-5 mr-2" />
                        Saya juga melihat masalah ini
                    </button>
                </div>

                {/* Public Timeline (Phase 3) */}
                <div>
                    <h3 className="font-bold text-textmain mb-4">Lini Masa Publik</h3>
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                        {(report.timelines || []).map((timeline) => {
                            const statusKey = timeline.status === 'dibuat' ? 'pending' :
                                              timeline.status === 'divalidasi' ? 'diproses' :
                                              timeline.status === 'diproses' ? 'diproses' :
                                              timeline.status === 'selesai' ? 'selesai' : 'ditolak';
                            const hs = getStatusStyle(statusKey);
                            const HIcon = hs.icon;
                            return (
                                <div key={timeline.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white ${hs.color} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10`}>
                                        <HIcon className="w-4 h-4" />
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                                        <div className="flex items-center justify-between space-x-2 mb-1">
                                            <div className="font-bold text-slate-900 text-sm capitalize">{timeline.status}</div>
                                            <time className="font-mono text-xs text-slate-500">{new Date(timeline.created_at).toLocaleDateString('id-ID', {month: 'short', day: 'numeric'})}</time>
                                        </div>
                                        <div className="text-slate-500 text-xs mt-2">{timeline.description}</div>
                                    </div>
                                </div>
                            );
                        })}
                        {(!report.timelines || report.timelines.length === 0) && report.histories.map((history) => {
                            const hs = getStatusStyle(history.new_status);
                            const HIcon = hs.icon;
                            return (
                                <div key={history.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white ${hs.color} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10`}>
                                        <HIcon className="w-4 h-4" />
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                                        <div className="flex items-center justify-between space-x-2 mb-1">
                                            <div className="font-bold text-slate-900 text-sm">{hs.text}</div>
                                            <time className="font-mono text-xs text-slate-500">{new Date(history.created_at).toLocaleDateString('id-ID')}</time>
                                        </div>
                                        <div className="text-slate-500 text-xs mt-2">{history.notes}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
}
