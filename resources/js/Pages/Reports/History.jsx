import { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import MobileLayout from '@/Layouts/MobileLayout';
import axios from 'axios';
import { ClockIcon, CheckCircleIcon, XCircleIcon, ExclamationCircleIcon, PhotoIcon, DocumentTextIcon, UserIcon, ShieldCheckIcon, BoltIcon, TrophyIcon } from '@heroicons/react/24/solid';

export default function History() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [badge, setBadge] = useState({ title: 'Warga Baru', bg: 'bg-gray-500', Icon: UserIcon, desc: 'Ayo buat laporan pertamamu!' });

    useEffect(() => {
        const fetchHistory = async () => {
            const savedIds = JSON.parse(localStorage.getItem('lapor_jalan_history') || '[]');
            
            // Gamification Badge Logic
            const count = savedIds.length;
            if (count >= 5) {
                setBadge({ title: 'Pahlawan Jalanan', bg: 'bg-amber-500', Icon: TrophyIcon, desc: 'Penyelamat pengguna jalan sejati!' });
            } else if (count >= 3) {
                setBadge({ title: 'Mata Elang', bg: 'bg-blue-600', Icon: BoltIcon, desc: 'Mata tajam penemu jalan rusak!' });
            } else if (count >= 1) {
                setBadge({ title: 'Warga Peduli', bg: 'bg-emerald-500', Icon: ShieldCheckIcon, desc: 'Terima kasih atas kepedulianmu!' });
            }

            if (savedIds.length === 0) {
                setLoading(false);
                return;
            }

            try {
                // Pass array as params (e.g. ?ids[]=1&ids[]=2)
                const response = await axios.get('/reports/history', { 
                    params: { ids: savedIds },
                    headers: { 'Accept': 'application/json' }
                });
                setReports(response.data);
            } catch (error) {
                console.error("Failed to fetch history", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const StatusBadge = ({ status }) => {
        const badges = {
            'pending': { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, text: 'Pending' },
            'diproses': { color: 'bg-blue-100 text-blue-800', icon: ExclamationCircleIcon, text: 'Diproses' },
            'selesai': { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, text: 'Selesai' },
            'ditolak': { color: 'bg-red-100 text-red-800', icon: XCircleIcon, text: 'Ditolak' }
        };
        const b = badges[status] || badges['pending'];
        const Icon = b.icon;
        
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${b.color}`}>
                <Icon className="w-3 h-3 mr-1" />
                {b.text}
            </span>
        );
    };

    return (
        <MobileLayout>
            <Head title="Riwayat Laporan" />
            <div className="p-4 bg-background min-h-screen pb-24">
                <h1 className="text-2xl font-extrabold text-textmain mb-4">Riwayat Laporan</h1>
                
                {/* Gamification Card - Premium Solid */}
                <div className={`mb-6 p-4 rounded-2xl text-white shadow-md relative overflow-hidden ${badge.bg}`}>
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white opacity-20 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-24 h-24 bg-black opacity-10 rounded-full blur-xl"></div>
                    
                    <div className="flex items-center gap-3 relative z-10">
                        <badge.Icon className="w-10 h-10 text-white drop-shadow-sm flex-shrink-0" />
                        <div className="flex-1">
                            <div className="text-[9px] font-extrabold uppercase tracking-widest text-white/80 mb-0.5">Tingkat Kontribusi</div>
                            <div className="text-lg font-black mb-0.5 drop-shadow-sm">{badge.title}</div>
                            <p className="text-[11px] text-white/90 font-medium leading-snug">{badge.desc}</p>
                        </div>
                    </div>
                </div>
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse bg-card p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                                <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                                <div className="flex-1 space-y-2 py-1">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : reports.length > 0 ? (
                    <div className="space-y-4">
                        {reports.map(report => (
                            <Link href={`/reports/${report.id}`} key={report.id} className="block bg-card p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                                <div className="flex gap-4">
                                    <div className="w-24 h-24 flex-shrink-0 relative rounded-lg overflow-hidden bg-gray-100">
                                        {report.photo_path ? (
                                            <img src={`/storage/${report.photo_path}`} alt="Bukti" className="w-full h-full object-cover" />
                                        ) : (
                                            <PhotoIcon className="w-8 h-8 text-gray-300 absolute inset-0 m-auto" />
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-semibold text-primary">{report.category?.name}</span>
                                        </div>
                                        <p className="text-sm font-bold text-textmain mb-2 line-clamp-2">{report.description}</p>
                                        <div>
                                            <StatusBadge status={report.status} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <DocumentTextIcon className="w-16 h-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">Belum ada riwayat laporan di perangkat ini.</p>
                        <Link href="/reports/create" className="mt-4 text-primary font-bold text-sm">Buat Laporan Sekarang</Link>
                    </div>
                )}
            </div>
        </MobileLayout>
    );
}
