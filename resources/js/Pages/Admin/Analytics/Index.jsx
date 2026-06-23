import AdminMobileLayout from '@/Layouts/AdminMobileLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';
import { SparklesIcon, ChartBarIcon, MapIcon, DocumentArrowDownIcon } from '@heroicons/react/24/solid';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function HeatmapLayer({ data }) {
    const map = useMap();

    useEffect(() => {
        if (!data || data.length === 0) return;

        // Transform data to [lat, lng, intensity] format
        const heatPoints = data.map(point => {
            // Intensity logic: pending/diproses = 1.0, selesai = 0.2
            const intensity = point.status === 'selesai' ? 0.2 : 1.0;
            return [parseFloat(point.latitude), parseFloat(point.longitude), intensity];
        });

        // Add heat layer to map
        const heatLayer = L.heatLayer(heatPoints, {
            radius: 25,
            blur: 15,
            maxZoom: 15,
            max: 1.0,
            gradient: {
                0.2: 'green',
                0.5: 'yellow',
                1.0: 'red'
            }
        }).addTo(map);

        return () => {
            map.removeLayer(heatLayer);
        };
    }, [data, map]);

    return null;
}

export default function AnalyticsIndex({ stats, categories, areas, weekly_trend, ai_summary, heatmap_data }) {
    return (
        <AdminMobileLayout>
            <Head title="Analytics & Intelligence" />
            
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 px-6 pt-10 pb-8 rounded-b-[40px] shadow-lg relative overflow-hidden">
                <div className="relative z-10 flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">Intelligence Layer</h1>
                        <p className="text-indigo-200 text-sm opacity-90 mt-1">Data agregat & Analisis Spasial AI</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                        <ChartBarIcon className="w-7 h-7 text-white" />
                    </div>
                </div>
            </div>

            <div className="px-5 py-6 space-y-6">
                
                {/* Export PDF Action */}
                <div className="flex justify-end">
                    <a href="/admin/analytics/export-pdf" className="flex items-center gap-2 bg-white text-indigo-700 px-4 py-2 rounded-xl border border-indigo-100 shadow-sm font-bold text-sm hover:bg-indigo-50 transition active:scale-95">
                        <DocumentArrowDownIcon className="w-5 h-5" />
                        Cetak Laporan PDF
                    </a>
                </div>
                
                {/* AI Summary */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-5 border border-indigo-100 shadow-sm relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-200/50 rounded-full blur-2xl"></div>
                    <div className="flex items-center gap-2 mb-3 relative z-10">
                        <SparklesIcon className="w-5 h-5 text-indigo-600" />
                        <h2 className="font-bold text-indigo-900">AI Auto Summary (Minggu Ini)</h2>
                    </div>
                    <p className="text-sm text-indigo-800 leading-relaxed relative z-10">
                        {ai_summary}
                    </p>
                </div>

                {/* Global Stats */}
                <div>
                    <h3 className="font-bold text-gray-800 mb-3 ml-1">Statistik Global</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                            <span className="text-3xl font-black text-gray-800">{stats.total}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Total Laporan</span>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                            <span className="text-3xl font-black text-green-500">{stats.selesai}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Total Selesai</span>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                            <span className="text-3xl font-black text-blue-500">{stats.diproses}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Diproses</span>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                            <span className="text-3xl font-black text-red-500">{stats.ditolak}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Ditolak</span>
                        </div>
                    </div>
                </div>

                {/* Weekly Trend Chart */}
                <div>
                    <h3 className="font-bold text-gray-800 mb-3 ml-1">Tren Laporan (7 Hari)</h3>
                    <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={weekly_trend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ stroke: '#e0e7ff', strokeWidth: 2 }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="count" 
                                    stroke="#4f46e5" 
                                    strokeWidth={4} 
                                    dot={{ stroke: '#4f46e5', strokeWidth: 2, r: 4, fill: '#fff' }} 
                                    activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }} 
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Infrastructure Heatmap */}
                <div>
                    <div className="flex items-center justify-between mb-3 ml-1">
                        <h3 className="font-bold text-gray-800">Infrastruktur Heatmap</h3>
                        <span className="text-xs text-red-500 font-bold flex items-center gap-1">
                            <MapIcon className="w-3 h-3" /> Area Kritis
                        </span>
                    </div>
                    <div className="w-full h-64 rounded-3xl overflow-hidden shadow-sm border border-gray-200 z-0 relative">
                        {heatmap_data && heatmap_data.length > 0 ? (
                            <MapContainer
                                center={[heatmap_data[0].latitude, heatmap_data[0].longitude]}
                                zoom={13}
                                className="w-full h-full"
                                zoomControl={false}
                            >
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <HeatmapLayer data={heatmap_data} />
                            </MapContainer>
                        ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                                Belum ada data keruangan
                            </div>
                        )}
                    </div>
                </div>

                {/* Category Stats */}
                <div>
                    <h3 className="font-bold text-gray-800 mb-3 ml-1">Statistik Kategori</h3>
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        {categories.map((cat, i) => (
                            <div key={i} className="p-4 border-b border-gray-50 last:border-0 flex items-center justify-between">
                                <span className="font-semibold text-gray-700 text-sm">{cat.name}</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-medium text-gray-400">{cat.count} laporan</span>
                                    <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">{cat.percentage}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Area Stats */}
                <div>
                    <h3 className="font-bold text-gray-800 mb-3 ml-1">Hotspot Wilayah (Top 5)</h3>
                    <div className="space-y-3">
                        {areas.map((area, i) => (
                            <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                <h4 className="font-bold text-gray-800 text-sm mb-2">{area.district_name}</h4>
                                <div className="flex gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">Laporan</span>
                                        <span className="text-sm font-black text-gray-700">{area.report_count}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-bold text-green-500 mb-0.5">Selesai</span>
                                        <span className="text-sm font-black text-green-600">{area.resolved_count}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-bold text-blue-500 mb-0.5">Diproses</span>
                                        <span className="text-sm font-black text-blue-600">{area.processing_count}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </AdminMobileLayout>
    );
}
