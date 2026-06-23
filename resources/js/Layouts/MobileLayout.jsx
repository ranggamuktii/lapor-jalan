import { Link, usePage } from '@inertiajs/react';
import { HomeIcon, PlusCircleIcon, MapIcon, DocumentTextIcon, QueueListIcon } from '@heroicons/react/24/outline';
import { HomeIcon as HomeSolid, PlusCircleIcon as PlusSolid, MapIcon as MapSolid, DocumentTextIcon as DocumentSolid, QueueListIcon as QueueListSolid } from '@heroicons/react/24/solid';

import { motion, AnimatePresence } from 'framer-motion';

export default function MobileLayout({ children }) {
    const { url } = usePage();

    const navItems = [
        { name: 'Beranda', href: '/', icon: HomeIcon, activeIcon: HomeSolid, active: url === '/' },
        { name: 'Lapor', href: '/reports/create', icon: PlusCircleIcon, activeIcon: PlusSolid, active: url.startsWith('/reports/create') },
        { name: 'Peta', href: '/reports/map', icon: MapIcon, activeIcon: MapSolid, active: url.startsWith('/reports/map') },
        { name: 'Linimasa', href: '/reports/feed', icon: QueueListIcon, activeIcon: QueueListSolid, active: url.startsWith('/reports/feed') },
        { name: 'Riwayat', href: '/reports/history', icon: DocumentTextIcon, activeIcon: DocumentSolid, active: url.startsWith('/reports/history') },
    ];

    return (
        <div className="min-h-screen bg-background text-textmain pb-20 max-w-md mx-auto relative shadow-lg sm:pb-0 sm:border-x overflow-x-hidden">
            <AnimatePresence mode="wait">
                <motion.main 
                    key={url}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="w-full"
                >
                    {children}
                </motion.main>
            </AnimatePresence>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 w-full max-w-md mx-auto bg-card border-t border-gray-200 flex justify-around items-center py-2 z-50">
                {navItems.map((item) => {
                    const Icon = item.active ? item.activeIcon : item.icon;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full py-1 ${
                                item.active ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            <Icon className="w-6 h-6 mb-1" />
                            <span className="text-xs font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
