import { useState, useRef, useEffect, Fragment } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MobileLayout from '@/Layouts/MobileLayout';
import { CameraIcon, MapPinIcon, UserIcon, PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { Dialog, Transition } from '@headlessui/react';
import { useAlert } from '@/Contexts/AlertContext';
import imageCompression from 'browser-image-compression';
import axios from 'axios';

export default function Create({ categories }) {
    const { showAlert } = useAlert();
    const [data, setData] = useState({
        website_url: '', // Honeypot
        category_id: '',
        description: '',
        reporter_email: '',
        latitude: '',
        longitude: '',
    });
    
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState('');
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    
    const [locationStatus, setLocationStatus] = useState('Mengambil lokasi...');
    
    // Auto get location
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    
                    setData(d => ({ ...d, latitude: lat, longitude: lon }));
                    
                    try {
                        const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                        if (res.data && res.data.display_name) {
                            // Extract a shorter name if possible (first 3 parts)
                            const parts = res.data.display_name.split(',');
                            const shortName = parts.slice(0, 3).join(',').trim();
                            setLocationStatus(shortName);
                        } else {
                            setLocationStatus('Lokasi berhasil didapatkan');
                        }
                    } catch (e) {
                        setLocationStatus('Lokasi berhasil didapatkan');
                    }
                },
                (error) => {
                    console.error(error);
                    setLocationStatus('Gagal mengambil lokasi. Mohon izinkan akses GPS.');
                },
                { enableHighAccuracy: true }
            );
        } else {
            setLocationStatus('Browser tidak mendukung geolocation.');
        }
    }, []);

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // SHOW PREVIEW IMMEDIATELY
            setPhotoPreview(URL.createObjectURL(file));
            setIsCompressing(true);
            
            const options = {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 1280,
                useWebWorker: true,
                fileType: 'image/jpeg'
            };
            try {
                const compressedFile = await imageCompression(file, options);
                setPhoto(compressedFile);
            } catch (error) {
                console.error("Compression failed:", error);
                // Fallback to original file if compression fails
                setPhoto(file); 
            } finally {
                setIsCompressing(false);
            }
        }
    };

    const submit = async (e) => {
        e.preventDefault();
        
        // Honeypot check
        if (data.website_url) {
            showAlert({
                title: 'Aktivitas Mencurigakan',
                text: 'Sistem mendeteksi indikasi spam.',
                icon: 'warning',
                confirmButtonColor: '#d33'
            });
            return;
        }

        setProcessing(true);
        setErrors({});

        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (key !== 'photo' || data[key]) {
                formData.append(key, data[key]);
            }
        });

        // Ensure we use the compressed photo if available (fallback)
        if (photo && !formData.has('photo')) {
            formData.append('photo', photo);
        }

        // TAHAP 5: Gamifikasi
        let deviceId = localStorage.getItem('lapor_jalan_device_id');
        if (!deviceId) {
            deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('lapor_jalan_device_id', deviceId);
        }
        formData.append('device_id', deviceId);

        try {
            const response = await axios.post('/reports', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Store ID locally for tracking
            const savedIds = JSON.parse(localStorage.getItem('lapor_jalan_history') || '[]');
            savedIds.push(response.data.report.id);
            localStorage.setItem('lapor_jalan_history', JSON.stringify(savedIds));

            showAlert({
                title: 'Berhasil!',
                text: 'Laporan Anda telah terkirim.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                router.visit('/reports/history');
            });
        } catch (error) {
            if (error.response && error.response.data.errors) {
                setErrors(error.response.data.errors);
            } else {
                showAlert({
                    title: 'Gagal',
                    text: 'Terjadi kesalahan saat mengirim laporan.',
                    icon: 'error',
                    confirmButtonColor: '#d33'
                });
            }
            setProcessing(false);
        }
    };

    return (
        <MobileLayout>
            <Head title="Buat Laporan" />
            <div className="p-4 bg-background min-h-screen pb-24">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-extrabold text-textmain">Buat Laporan</h1>
                </div>
                
                <form onSubmit={submit} className="space-y-5 bg-card p-4 rounded-2xl shadow-sm border border-gray-100">
                    
                    {/* Honeypot field (hidden) */}
                    <div className="hidden opacity-0 absolute">
                        <label>Website URL</label>
                        <input type="text" name="website_url" value={data.website_url} onChange={e => setData({...data, website_url: e.target.value})} tabIndex="-1" autoComplete="off" />
                    </div>

                    {/* Location Badge */}
                    <div className={`p-3 rounded-xl text-sm font-medium flex items-center ${data.latitude ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        <MapPinIcon className="w-5 h-5 mr-2" />
                        {locationStatus}
                    </div>
                    {errors.latitude && <p className="text-red-500 text-xs">{errors.latitude[0]}</p>}

                    {/* Camera */}
                    <div>
                        <label className="block text-sm font-semibold text-textmain mb-1">Bukti Foto</label>
                        {!photoPreview ? (
                            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <CameraIcon className="w-10 h-10 text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500 font-medium">Ambil Foto</p>
                                </div>
                                <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handlePhotoChange} />
                            </label>
                        ) : (
                            <div className="relative">
                                <img src={photoPreview} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                                <button type="button" onClick={() => { setPhoto(null); setPhotoPreview(''); }} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full text-xs shadow-lg font-bold">
                                    Ganti Foto
                                </button>
                            </div>
                        )}
                        {errors.photo && <p className="text-red-500 text-xs mt-1">{errors.photo[0]}</p>}
                    </div>

                    {/* Category (Mobile Bottom Sheet) */}
                    <div>
                        <label className="block text-sm font-semibold text-textmain mb-1">Kategori</label>
                        <div 
                            onClick={() => setIsCategoryModalOpen(true)}
                            className="w-full rounded-xl border border-gray-300 bg-white p-3 shadow-sm flex justify-between items-center cursor-pointer"
                        >
                            <span className={data.category_id ? "text-gray-900 font-medium" : "text-gray-500"}>
                                {data.category_id ? categories.find(c => c.id == data.category_id)?.name : "-- Pilih Kategori --"}
                            </span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                        </div>
                        {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id[0]}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-textmain mb-1">Deskripsi Masalah</label>
                        <textarea 
                            className="w-full rounded-xl border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                            rows="3"
                            placeholder="Contoh: Jalan berlubang cukup dalam di dekat pertigaan..."
                            value={data.description}
                            onChange={e => setData({...data, description: e.target.value})}
                        ></textarea>
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description[0]}</p>}
                    </div>

                    {/* Email Input */}
                    <div>
                        <label className="block text-sm font-semibold text-textmain mb-1">Email Aktif (Opsional)</label>
                        <p className="text-xs text-gray-500 mb-2">Kami akan mengirimkan notifikasi saat laporan Anda dikerjakan.</p>
                        <input 
                            type="email"
                            className="w-full rounded-xl border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                            placeholder="nama@email.com"
                            value={data.reporter_email}
                            onChange={e => setData({...data, reporter_email: e.target.value})}
                        />
                        {errors.reporter_email && <p className="text-red-500 text-xs mt-1">{errors.reporter_email[0]}</p>}
                    </div>

                    <button 
                        type="submit" 
                        disabled={processing || isCompressing || !data.latitude || !photo}
                        className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-500/30 text-base font-bold text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:shadow-none active:scale-95 transition"
                    >
                        {isCompressing ? 'Mengompresi Foto...' : (processing ? 'Mengirim Laporan...' : 'Kirim Laporan')}
                    </button>
                </form>
            </div>

            {/* Bottom Sheet Modal for Categories */}
            <Transition appear show={isCategoryModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-[500]" onClose={() => setIsCategoryModalOpen(false)}>
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
                        <div className="flex min-h-full items-end justify-center text-center sm:p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-full"
                                enterTo="opacity-100 translate-y-0"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0"
                                leaveTo="opacity-0 translate-y-full"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-t-[32px] sm:rounded-[32px] bg-white text-left align-middle shadow-2xl transition-all pb-8 pt-4 px-5">
                                    <div className="flex justify-between items-center mb-5">
                                        <h3 className="text-xl font-black text-gray-900">Pilih Kategori</h3>
                                        <button onClick={() => setIsCategoryModalOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:text-gray-700">
                                            <XMarkIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {categories.map((cat) => (
                                            <div 
                                                key={cat.id}
                                                onClick={() => {
                                                    setData({...data, category_id: cat.id});
                                                    setIsCategoryModalOpen(false);
                                                }}
                                                className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition ${
                                                    data.category_id == cat.id 
                                                    ? 'border-primary bg-blue-50/50' 
                                                    : 'border-gray-100 hover:border-primary/50 bg-white hover:bg-gray-50'
                                                }`}
                                            >
                                                <span className={`font-bold text-base ${data.category_id == cat.id ? 'text-primary' : 'text-gray-700'}`}>
                                                    {cat.name}
                                                </span>
                                                {data.category_id == cat.id && (
                                                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5 text-white">
                                                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </MobileLayout>
    );
}
