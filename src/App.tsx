/* eslint-disable node/no-unpublished-import */
import { Home, Sidebar, Accounts, Settings, Load, Info } from '@Components'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useGlobal } from '@/exports'

const App = (): JSX.Element => {
	const isLoading = useGlobal().isLoading

	return isLoading ? (
		<Load />
	) : (
		<Router>
			<div className="flex flex-row overflow-hidden">
				<Sidebar />
				<RouteRenderer />
			</div>
		</Router>
	)
}

const RouteRenderer = (): JSX.Element => {
	const location = useLocation()

	return (
		<AnimatePresence mode="wait">
			<Routes location={location} key={location.pathname}>
				<Route path="/" element={<Home />} />
				<Route path="accounts" element={<Accounts />} />
				<Route path="settings" element={<Settings />} />
				<Route path="info" element={<Info />} />
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</AnimatePresence>
	)
}

export default App
