/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{ts,tsx}'],
	theme: {
		extend: {
			colors: {
				primary: '#181818',
				secondary: '#F6CF57',
				tertiary: '#8B8000',
				navbar: '#202020'
			}
		}
	},
	plugins: []
}
