import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function GlobalLoader() {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let timeout = null;

        const startListener = router.on('start', () => {
            // Wait 150ms before showing loader to prevent flashing on fast loads
            timeout = setTimeout(() => setLoading(true), 150);
        });

        const finishListener = router.on('finish', () => {
            clearTimeout(timeout);
            setLoading(false);
        });

        return () => {
            startListener();
            finishListener();
            clearTimeout(timeout);
        };
    }, []);

    if (!loading) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/50 backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-white p-5 rounded-2xl shadow-2xl flex flex-col items-center border border-gray-100">
                <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
                <p className="text-sm font-bold text-gray-800 animate-pulse">Memuat Data...</p>
            </div>
        </div>
    );
}
