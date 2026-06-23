import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-800 max-w-md mx-auto relative sm:border-x flex flex-col justify-center px-6">
            <div className="relative z-10 w-full mb-6 text-center flex flex-col items-center">
                <Link href="/">
                    <ApplicationLogo className="w-28 h-28 fill-current text-gray-500 drop-shadow-sm rounded-2xl" />
                </Link>
                <h1 className="text-2xl font-black text-neutral-800 tracking-tight">Login Admin</h1>
                <p className="text-neutral-500 text-sm mt-1 font-medium">Portal Pengaduan Infrastruktur</p>
            </div>

            <div className="relative z-10 w-full bg-white px-6 py-8 shadow-sm rounded-2xl border border-neutral-200">
                {children}
            </div>
        </div>
    );
}
