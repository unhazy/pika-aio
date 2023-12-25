/* eslint-disable node/no-unpublished-import */
import { motion, MotionConfig, useAnimate } from 'framer-motion'
import { icon } from '@Assets'
import { setGlobal } from '@/exports'
import { useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/tauri'

const Load = (): JSX.Element => {
	const globalCtx = setGlobal()
	const [scope, animate] = useAnimate()
	const [options, setOptions] = useState({
		isInit: false,
		percentage: 0,
		displaySpan: 'Finding node version...'
	})

	useEffect(() => {
		if (options.isInit) {
			animate(scope.current, { width: `${options.percentage}%` }, { ease: 'easeInOut' }).then(() => {
				if (options.percentage > 99)
					setTimeout(() => globalCtx((prevObject) => ({ ...prevObject, isLoading: false })), 2000)
			})
		} else {
			localStorage.clear()
			setOptions((prevOptions) => ({ ...prevOptions, isInit: true }))
			setTimeout(() => {
				invoke('node_check')
					.then((output) => {
						setOptions((prevOptions) => ({
							...prevOptions,
							displaySpan: `Found: ${(
								output as string
							).trim()}. Installing dependencies. (May take a while)`,
							percentage: prevOptions.percentage + 33
						}))
						invoke('install_dependencies')
							.then(() => {
								setOptions((prevOptions) => ({
									...prevOptions,
									displaySpan: 'Dependencies installed. Initializing socket...',
									percentage: prevOptions.percentage + 33
								}))
								setTimeout(
									() =>
										invoke('run_express')
											.then((pid) => {
												globalCtx((prevObject) => ({
													...prevObject,
													processID: pid as number
												}))
												setOptions((prevOptions) => ({
													...prevOptions,
													displaySpan: `Thread initialized. ID: ${pid as number}`,
													percentage: prevOptions.percentage + 34
												}))
											})
											.catch((err) =>
												setOptions((prevOptions) => ({ ...prevOptions, displaySpan: err }))
											),
									2000
								)
							})
							.catch((err) => setOptions((prevOptions) => ({ ...prevOptions, displaySpan: err })))
					})
					.catch((err) => setOptions((prevOptions) => ({ ...prevOptions, displaySpan: err })))
			}, 2000)
		}
	}, [options.percentage])

	return (
		<MotionConfig transition={{ type: 'spring', duration: 1 }}>
			<div className="flex flex-col space-y-4 h-screen w-screen justify-center items-center bg-primary text-secondary">
				<motion.img initial={{ scale: 0 }} animate={{ scale: 1 }} src={icon} alt="Icon" className="w-64" />
				<motion.div
					className="rounded-full overflow-hidden w-1/2 h-1 bg-navbar"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
				>
					<motion.div ref={scope} initial={{ width: 0 }} className="bg-secondary h-full" />
				</motion.div>
				<motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
					{options.displaySpan}
				</motion.span>
			</div>
		</MotionConfig>
	)
}

export default Load
