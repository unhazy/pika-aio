/* eslint-disable node/no-unpublished-import */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import ts_config_paths from 'vite-tsconfig-paths'

export default defineConfig(async () => ({
	plugins: [react(), ts_config_paths()],
	clearScreen: false,
	server: {
		port: 1420,
		strictPort: true
	}
}))
