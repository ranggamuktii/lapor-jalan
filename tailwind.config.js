import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                background: '#F8FAFC',
                card: '#FFFFFF',
                primary: '#2563EB',
                success: '#22C55E',
                warning: '#F59E0B',
                danger: '#EF4444',
                textmain: '#1E293B',
            }
        },
    },

    plugins: [forms],
};
