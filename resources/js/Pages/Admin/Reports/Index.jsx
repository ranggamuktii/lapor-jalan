import AdminMobileLayout from '@/Layouts/AdminMobileLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useRef, useState, useEffect, Fragment } from 'react';
import { useAlert } from '@/Contexts/AlertContext';
import { CheckCircleIcon, ClockIcon, ExclamationCircleIcon, XCircleIcon, ShieldCheckIcon, MapPinIcon, ChevronRightIcon, CalendarIcon, UserCircleIcon, EyeIcon } from '@heroicons/react/24/solid';
import { Dialog, Transition } from '@headlessui/react';
import axios from 'axios';

export default function Index({ reports }) {
    const { auth } = usePage().props;
    const adminName = auth?.user?.name || 'Admin';
    const adminFirstName = adminName.split(' ')[0];

    const { showAlert } = useAlert();
    const fileInputRef = useRef(null);
    const [selectedReportId, setSelectedReportId] = useState(null);
    const [activeTab, setActiveTab] = useState('Semua');
    const [previewReport, setPreviewReport] = useState(null);
    
    // AI Summary State
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [aiSummary, setAiSummary] = useState(null);

    const [address, setAddress] = useState("Memuat lokasi...");

    useEffect(() => {
        if (previewReport) {
            setAddress("Memuat lokasi...");
            axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${previewReport.latitude}&lon=${previewReport.longitude}`)
                .then(res => {
                    if (res.data && res.data.display_name) {
                        const parts = res.data.display_name.split(',');
                        setAddress(parts.slice(0, 3).join(',').trim());
                    } else {
                        setAddress("Lokasi tidak diketahui");
                    }
                })
                .catch(() => setAddress("Gagal memuat lokasi"));
        }
    }, [previewReport]);

    const stats = {
        total: reports.length,
        pending: reports.filter(r => r.status === 'pending').length,
        diproses: reports.filter(r => r.status === 'diproses' || r.status === 'validated').length,
        selesai: reports.filter(r => r.status === 'selesai').length,
    };

    const tabs = ['Semua', 'Menunggu', 'Diproses', 'Selesai'];
    
    const filteredReports = reports.filter(r => {
        if (activeTab === 'Semua') return true;
        if (activeTab === 'Menunggu') return r.status === 'pending';
        if (activeTab === 'Diproses') return r.status === 'diproses' || r.status === 'validated';
        if (activeTab === 'Selesai') return r.status === 'selesai';
        return true;
    });

    const handleAction = (id, action) => {
        if (action === 'resolve') {
            setSelectedReportId(id);
            setPreviewReport(null);
            showAlert({
                title: 'Konfirmasi Penyelesaian',
                text: 'Punya foto bukti perbaikan? Klik "Unggah Foto" atau "Selesai Tanpa Foto".',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Unggah Foto',
                cancelButtonText: 'Tanpa Foto',
                confirmButtonColor: '#3b82f6',
            }).then((result) => {
                if (result.isConfirmed) {
                    fileInputRef.current.click();
                } else if (result.dismiss === 'cancel') {
                    router.patch(`/admin/reports/${id}/resolve`);
                }
            });
            return;
        }

        let actionText = action === 'validate' ? 'terima' : action === 'process' ? 'proses' : action;
        
        // Hide preview modal when taking action
        setPreviewReport(null);
        
        showAlert({
            title: 'Konfirmasi',
            text: `Yakin ingin mengubah status laporan menjadi ${actionText}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, ubah!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.patch(`/admin/reports/${id}/${action}`);
            }
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && selectedReportId) {
            const formData = new FormData();
            formData.append('_method', 'patch');
            formData.append('resolved_photo', file);
            
            router.post(`/admin/reports/${selectedReportId}/resolve`, formData, {
                forceFormData: true,
                onFinish: () => setSelectedReportId(null)
            });
        }
    };

    const getStatusColor = (status) => {
        if (status === 'selesai') return 'bg-green-500 text-white';
        if (status === 'diproses' || status === 'validated') return 'bg-blue-500 text-white';
        if (status === 'ditolak') return 'bg-red-500 text-white';
        return 'bg-yellow-400 text-yellow-900';
    };

    const getSeverityStyle = (severity) => {
        if (severity === 'kritis') return 'bg-red-600 text-white animate-pulse shadow-md shadow-red-600/30';
        if (severity === 'parah') return 'bg-orange-500 text-white';
        if (severity === 'sedang') return 'bg-yellow-400 text-yellow-900';
        if (severity === 'rendah') return 'bg-green-500 text-white';
        return 'bg-gray-200 text-gray-500';
    };

    const getStatusText = (status) => {
        if (status === 'pending') return 'Menunggu';
        if (status === 'validated') return 'Diterima';
        return status;
    };

    const handleSummarize = async () => {
        setIsSummarizing(true);
        try {
            const res = await axios.get('/admin/reports/summarize');
            setAiSummary(res.data.summary);
            showAlert({
                title: 'Ringkasan Cerdas AI',
                html: `<div class="text-left text-sm text-gray-700 leading-relaxed">${res.data.summary}</div>`,
                icon: 'info',
                confirmButtonText: 'Tutup',
                confirmButtonColor: '#3b82f6',
            });
        } catch (error) {
            showAlert({
                title: 'Gagal',
                text: 'Gagal menghubungi layanan AI.',
                icon: 'error'
            });
        } finally {
            setIsSummarizing(false);
        }
    };

    return (
        <AdminMobileLayout>
            <Head title="Dashboard Admin" />
            <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="image/*" />

            {/* Header Area */}
            <div className="bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-800 px-6 pt-10 pb-20 rounded-b-[40px] shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
                    <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white blur-3xl"></div>
                    <div className="absolute bottom-0 left-10 w-32 h-32 rounded-full bg-blue-300 blur-2xl"></div>
                </div>
                
                <div className="relative z-10 flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">Halo, {adminFirstName}!</h1>
                        <p className="text-blue-100 text-sm opacity-90 mt-1">Kelola laporan warga dengan sigap.</p>
                    </div>
                    <div className="w-14 h-14 rounded-full border-2 border-white/50 overflow-hidden shadow-lg bg-white/20 backdrop-blur-md p-0.5">
                        <img src={`https://ui-avatars.com/api/?name=${adminName}&background=random&color=fff`} alt={adminName} className="w-full h-full rounded-full object-cover" />
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="px-5 -mt-12 relative z-20">
                <div className="grid grid-cols-4 gap-2 bg-white p-3 rounded-3xl shadow-lg border border-gray-100/50">
                    <div className="flex flex-col items-center p-2 rounded-2xl bg-gray-50">
                        <div className="text-xl font-black text-gray-800">{stats.total}</div>
                        <span className="text-[9px] font-bold text-gray-500 uppercase mt-1">Total</span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-2xl bg-yellow-50">
                        <div className="text-xl font-black text-yellow-600">{stats.pending}</div>
                        <span className="text-[9px] font-bold text-yellow-600 uppercase mt-1">Antri</span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-2xl bg-blue-50">
                        <div className="text-xl font-black text-blue-600">{stats.diproses}</div>
                        <span className="text-[9px] font-bold text-blue-600 uppercase mt-1">Proses</span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-2xl bg-green-50">
                        <div className="text-xl font-black text-green-600">{stats.selesai}</div>
                        <span className="text-[9px] font-bold text-green-600 uppercase mt-1">Selesai</span>
                    </div>
                </div>
            </div>

            {/* Filter Tabs & AI Button */}
            <div className="px-5 mt-6 mb-4 flex justify-between items-center gap-3">
                <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide flex-1">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                                activeTab === tab 
                                ? 'bg-gray-900 text-white shadow-md transform scale-105' 
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                
                <button 
                    onClick={handleSummarize}
                    disabled={isSummarizing}
                    className="flex-shrink-0 bg-blue-100 text-blue-700 p-2.5 rounded-full shadow-sm hover:bg-blue-200 active:scale-95 transition flex items-center justify-center mb-2"
                    title="Buat Ringkasan AI"
                >
                    {isSummarizing ? (
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.577 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.577 2.577l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.577-2.577l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5z" clipRule="evenodd" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Report List */}
            <div className="px-5 pb-6 space-y-4">
                {filteredReports.length === 0 ? (
                    <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-sm mt-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircleIcon className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="font-bold text-gray-800 mb-1">Kosong</h3>
                        <p className="text-sm text-gray-500">Tidak ada laporan dengan status ini.</p>
                    </div>
                ) : (
                    filteredReports.map((report) => (
                        <div 
                            key={report.id} 
                            onClick={() => setPreviewReport(report)}
                            className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100 transition-all hover:shadow-md cursor-pointer group"
                        >
                            <div className="flex p-3 gap-3">
                                {/* Thumbnail */}
                                {report.photo_path ? (
                                    <div className="w-24 h-24 rounded-2xl overflow-hidden relative flex-shrink-0">
                                        <img src={`/storage/${report.photo_path}`} className="w-full h-full object-cover" alt="Bukti" />
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                                    </div>
                                ) : (
                                    <div className="w-24 h-24 rounded-2xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                                        <EyeIcon className="w-8 h-8 text-gray-300" />
                                    </div>
                                )}
                                
                                {/* Content */}
                                <div className="flex flex-col justify-between flex-1 py-1 pr-1">
                                    <div>
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex gap-1">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${getStatusColor(report.status)}`}>
                                                    {getStatusText(report.status)}
                                                </span>
                                                {report.severity && report.severity !== 'belum_dinilai' && (
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${getSeverityStyle(report.severity)}`}>
                                                        {report.severity}
                                                    </span>
                                                )}
                                                {report.is_duplicate_of && (
                                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-100 text-purple-700">
                                                        DUPLIKAT
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[10px] font-medium text-gray-400">
                                                {new Date(report.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-gray-800 text-sm leading-tight mb-1 line-clamp-1">{report.category?.name}</h3>
                                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{report.description}</p>
                                        
                                        {report.ai_tags && report.ai_tags.length > 0 && (
                                            <div className="flex gap-1 mt-1.5 flex-wrap">
                                                {report.ai_tags.map((tag, idx) => (
                                                    <span key={idx} className="text-[9px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">#{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-end items-center mt-2">
                                        <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
                                            Tinjau <ChevronRightIcon className="w-3 h-3" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Preview Modal (Bottom Sheet) */}
            <Transition appear show={previewReport !== null} as={Fragment}>
                <Dialog as="div" className="relative z-[500]" onClose={() => setPreviewReport(null)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center text-center sm:items-center sm:p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-t-[32px] sm:rounded-[32px] bg-white text-left align-middle shadow-2xl transition-all pb-6">
                                    {previewReport && (
                                        <div className="relative">
                                            {/* Header Image */}
                                            {previewReport.photo_path ? (
                                                <div className="w-full h-64 relative">
                                                    <img src={`/storage/${previewReport.photo_path}`} className="w-full h-full object-cover" alt="Bukti" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                                    
                                                    {/* Top close button */}
                                                    <button onClick={() => setPreviewReport(null)} className="absolute top-4 right-4 w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60">
                                                        <XCircleIcon className="w-6 h-6" />
                                                    </button>

                                                    <div className="absolute bottom-4 left-5 right-5">
                                                        <div className="flex gap-2 mb-2">
                                                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${getStatusColor(previewReport.status)}`}>
                                                                {getStatusText(previewReport.status)}
                                                            </span>
                                                            {previewReport.severity && previewReport.severity !== 'belum_dinilai' && (
                                                                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${getSeverityStyle(previewReport.severity)}`}>
                                                                    {previewReport.severity}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h3 className="text-xl font-black text-white">{previewReport.category?.name}</h3>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-full pt-12 pb-4 px-5 bg-gray-50 flex justify-between items-end">
                                                    <div>
                                                        <span className={`inline-block px-3 py-1 mb-2 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${getStatusColor(previewReport.status)}`}>
                                                            {getStatusText(previewReport.status)}
                                                        </span>
                                                        <h3 className="text-xl font-black text-gray-900">{previewReport.category?.name}</h3>
                                                    </div>
                                                    <button onClick={() => setPreviewReport(null)} className="mb-2 text-gray-400 hover:text-gray-600">
                                                        <XCircleIcon className="w-8 h-8" />
                                                    </button>
                                                </div>
                                            )}

                                            <div className="px-5 py-6">
                                                {/* Details */}
                                                <div className="flex flex-col gap-3 mb-6">
                                                    <div className="flex items-start gap-3">
                                                        <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                                                        <div>
                                                            <div className="text-[10px] font-bold uppercase text-gray-400">Waktu Laporan</div>
                                                            <div className="text-sm font-semibold text-gray-800">
                                                                {new Date(previewReport.created_at).toLocaleDateString('id-ID', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'})}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                        <MapPinIcon className="w-5 h-5 text-red-500 mt-0.5" />
                                                        <div>
                                                            <div className="text-[10px] font-bold uppercase text-gray-400">Lokasi</div>
                                                            <div className="text-sm font-semibold text-gray-800">
                                                                {address}
                                                            </div>
                                                            <div className="text-xs font-medium text-gray-500 mt-0.5">
                                                                <a href={`https://maps.google.com/?q=${previewReport.latitude},${previewReport.longitude}`} target="_blank" className="text-blue-600 hover:underline">
                                                                    {previewReport.latitude}, {previewReport.longitude}
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-gray-50 p-4 rounded-2xl mb-6">
                                                    <div className="text-[10px] font-bold uppercase text-gray-400 mb-1">Deskripsi Laporan</div>
                                                    <p className="text-sm text-gray-700 leading-relaxed">{previewReport.description}</p>
                                                    
                                                    {previewReport.ai_tags && previewReport.ai_tags.length > 0 && (
                                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                                            <div className="text-[10px] font-bold uppercase text-blue-500 mb-2 flex items-center gap-1">
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.06-1.06zM6.464 14.596a.75.75 0 10-1.06-1.06l-1.06 1.06a.75.75 0 001.06 1.06l1.06-1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zM14.596 15.657a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.06 1.06l1.06 1.06zM5.404 6.464a.75.75 0 001.06-1.06l-1.06-1.06a.75.75 0 10-1.061 1.06l1.06 1.06z" clipRule="evenodd" /></svg>
                                                                AI Auto-Tags
                                                            </div>
                                                            <div className="flex gap-2 flex-wrap">
                                                                {previewReport.ai_tags.map((tag, idx) => (
                                                                    <span key={idx} className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded-lg">#{tag}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex flex-col gap-2">
                                                    {previewReport.status === 'pending' && (
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleAction(previewReport.id, 'reject')} className="flex-1 bg-red-50 text-red-600 py-3.5 rounded-xl text-sm font-bold active:scale-95 transition-transform">Tolak</button>
                                                            <button onClick={() => handleAction(previewReport.id, 'validate')} className="flex-1 bg-green-600 text-white py-3.5 rounded-xl text-sm font-bold active:scale-95 transition-transform shadow-lg shadow-green-600/20 hover:bg-green-700">Terima Valid</button>
                                                        </div>
                                                    )}
                                                    {previewReport.status === 'validated' && (
                                                        <button onClick={() => handleAction(previewReport.id, 'process')} className="w-full bg-blue-600 text-white py-3.5 rounded-xl text-sm font-bold active:scale-95 transition-transform shadow-lg shadow-blue-600/20">Mulai Proses Perbaikan</button>
                                                    )}
                                                    {previewReport.status === 'diproses' && (
                                                        <button onClick={() => handleAction(previewReport.id, 'resolve')} className="w-full bg-green-500 text-white py-3.5 rounded-xl text-sm font-bold active:scale-95 transition-transform shadow-lg shadow-green-500/20">Tandai Selesai</button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </AdminMobileLayout>
    );
}
