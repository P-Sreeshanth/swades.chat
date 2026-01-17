/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            colors: {
                sidebar: {
                    bg: '#1a1f2e',
                    hover: '#252b3d',
                    border: '#2d3548',
                },
                brand: {
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#6366f1',
                    600: '#4f46e5',
                    700: '#4338ca',
                }
            },
            boxShadow: {
                'card': '0 2px 8px rgba(0,0,0,0.08)',
                'input': '0 4px 20px rgba(0,0,0,0.08)',
            }
        },
    },
    plugins: [],
}
