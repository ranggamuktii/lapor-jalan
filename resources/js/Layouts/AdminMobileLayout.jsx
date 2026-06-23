import { Link, usePage } from '@inertiajs/react';
import { InboxStackIcon, ArrowRightOnRectangleIcon, ChartPieIcon } from '@heroicons/react/24/outline';
import { InboxStackIcon as InboxSolid, ChartPieIcon as ChartPieSolid } from '@heroicons/react/24/solid';

export default function AdminMobileLayout({ children }) {
    const { url } = usePage();

    const navItems = [
        { name: 'Laporan', href: '/admin/reports', icon: InboxStackIcon, activeIcon: InboxSolid, active: url.startsWith('/admin/reports') },
        { name: 'Analytics', href: '/admin/analytics', icon: ChartPieIcon, activeIcon: ChartPieSolid, active: url.startsWith('/admin/analytics') },
    ];

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 pb-20 max-w-md mx-auto relative shadow-xl sm:pb-20 sm:border-x">
            <main className="w-full">
                {children}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 w-full max-w-md mx-auto bg-white border-t border-gray-200 flex justify-around items-center py-2 z-50 rounded-t-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                {navItems.map((item) => {
                    const Icon = item.active ? item.activeIcon : item.icon;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full py-1 ${
                                item.active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            <Icon className="w-6 h-6 mb-1" />
                            <span className="text-[10px] font-bold">{item.name}</span>
                        </Link>
                    );
                })}
                
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="flex flex-col items-center justify-center w-full py-1 text-red-400 hover:text-red-600"
                >
                    <ArrowRightOnRectangleIcon className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold">Keluar</span>
                </Link>
            </nav>
        </div>
    );
}
