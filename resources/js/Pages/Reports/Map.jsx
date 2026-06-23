import { Head } from '@inertiajs/react';
import MobileLayout from '@/Layouts/MobileLayout';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';
import { ExclamationTriangleIcon, LightBulbIcon, MapPinIcon as MapPinIconSolid } from '@heroicons/react/24/solid';
import axios from 'axios';
import { useAlert } from '@/Contexts/AlertContext';

export default function Map({ reports }) {
    const { showAlert } = useAlert();
    const center = [-6.406, 107.454];

    // Create icon dynamically to allow visual pixel offsets
    const createDynamicIcon = (report, offsetIndex) => {
        let IconComponent = MapPinIconSolid;
        let colorClass = 'text-blue-600';
        let bgClass = 'bg-blue-50';

        if (report.category?.name?.toLowerCase().includes('lampu')) {
            IconComponent = LightBulbIcon;
            colorClass = 'text-amber-500';
            bgClass = 'bg-amber-50';
        } else if (report.category?.name?.toLowerCase().includes('rusak') || report.category?.name?.toLowerCase().includes('jalan')) {
            IconComponent = ExclamationTriangleIcon;
            colorClass = 'text-red-600';
            bgClass = 'bg-red-50';
        }

        // Shift 15px right and 15px down for each overlapping marker
        const shiftX = offsetIndex * 15;
        const shiftY = offsetIndex * 15;

        const htmlString = renderToString(
            <div className={`w-10 h-10 flex items-center justify-center rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.15)] border-2 border-white ${colorClass} ${bgClass}`}>
                <IconComponent className="w-6 h-6" />
            </div>
        );
        return L.divIcon({
            html: htmlString,
            className: 'custom-svg-marker bg-transparent border-0',
            iconSize: [40, 40],
            iconAnchor: [20 - shiftX, 40 - shiftY], // Shifting anchor moves icon visually
            popupAnchor: [shiftX, -40 + shiftY], // Shift popup so it stays pointing to the icon
        });
    };

    return (
        <MobileLayout>
            <Head title="Peta Laporan" />
            <style>{`
                .custom-popup .leaflet-popup-content-wrapper {
                    padding: 0;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
                    border: none;
                }
                .custom-popup .leaflet-popup-content {
                    margin: 0;
                    width: 250px !important;
                }
                .custom-popup .leaflet-popup-tip {
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
                }
            `}</style>
            <div className="h-screen flex flex-col relative pb-16">
                <div className="absolute top-4 left-4 right-4 z-[400] bg-white p-3 rounded-xl shadow-lg border border-gray-100 flex justify-between items-center">
                    <h1 className="font-extrabold text-textmain">Peta Laporan Warga</h1>
                    <div className="flex gap-3 text-xs font-semibold">
                        <span className="flex items-center gap-1.5"><ExclamationTriangleIcon className="w-4 h-4 text-red-600" /> Jalan</span>
                        <span className="flex items-center gap-1.5"><LightBulbIcon className="w-4 h-4 text-amber-500" /> Lampu</span>
                    </div>
                </div>

                <div className="flex-1 z-0 relative">
                    <MapContainer center={center} zoom={13} className="w-full h-full" zoomControl={false}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {(() => {
                            const locationCount = {};
                            return reports.map((report) => {
                                const locKey = `${report.latitude},${report.longitude}`;
                                if (!locationCount[locKey]) locationCount[locKey] = 0;
                                const offsetIndex = locationCount[locKey];
                                locationCount[locKey]++;

                                const icon = createDynamicIcon(report, offsetIndex);

                                return (
                                    <Marker 
                                        key={report.id} 
                                        position={[parseFloat(report.latitude), parseFloat(report.longitude)]} 
                                        icon={icon}
                                        zIndexOffset={-offsetIndex * 100} // Ensure the shifted one goes underneath
                                    >
                                    <Popup className="custom-popup">
                                        <div className="flex flex-col bg-white">
                                            {report.photo_path && (
                                                <div className="relative w-full h-32">
                                                    <img 
                                                        src={`/storage/${report.photo_path}`} 
                                                        alt="Bukti" 
                                                        className="w-full h-full object-cover" 
                                                        loading="lazy"
                                                    />
                                                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded">
                                                        {new Date(report.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="p-4">
                                                <div className="flex justify-between items-center mb-1.5">
                                                    <span className="text-[11px] font-medium text-blue-600 uppercase tracking-wide">{report.category?.name}</span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                                        report.status === 'selesai' ? 'bg-green-100 text-green-700' :
                                                        report.status === 'diproses' ? 'bg-blue-100 text-blue-700' :
                                                        report.status === 'ditolak' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                        {report.status}
                                                    </span>
                                                </div>
                                                
                                                <p className="text-[13px] text-gray-700 leading-snug line-clamp-2 mb-3">
                                                    {report.description}
                                                </p>
                                                
                                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center text-[11px] text-gray-500">
                                                            <span className="mr-1">👍</span> {report.upvotes_count || 0} Dukungan
                                                        </div>
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
                                                            className="text-gray-400 hover:text-red-500 transition"
                                                            title="Laporkan Konten"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a15.26 15.26 0 0 1 9.46 0l2.77.693M3 15V4.5M3 4.5 5.77 3.807a15.26 15.26 0 0 1 9.46 0L18 4.5m0 0v10.5m-15 0v-10.5" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    <a href={`/reports/${report.id}`} className="text-[11px] font-medium text-blue-600 hover:text-blue-800 transition">
                                                        Lihat Detail &rarr;
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                            });
                        })()}
                    </MapContainer>
                </div>
            </div>
        </MobileLayout>
    );
}
