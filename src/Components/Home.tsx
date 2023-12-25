/* eslint-disable node/no-unpublished-import */
import { invoke } from '@tauri-apps/api/tauri'
import { motion, MotionConfig } from 'framer-motion'
import { useEffect, useState } from 'react'
import { FaSkull } from 'react-icons/fa'
import { BsMinecartLoaded } from 'react-icons/bs'
import { useGlobal, Settings as Config, defaultSettings } from '@/exports'

const Home = (): JSX.Element => {
	const [options, setOptions] = useState({
		isRunning: false,
		accArray: [''],
		msgArray: [''],
		config: defaultSettings
	})
	const ctxServer = useGlobal().httpServer

	useEffect(() => {
		ctxServer.on('message', (msg) =>
			setOptions((prevOptions) => ({ ...prevOptions, msgArray: [...prevOptions.msgArray, msg] }))
		)
		const hasBool = localStorage.getItem('bool')
		if (hasBool) setOptions((prevOptions) => ({ ...prevOptions, isRunning: JSON.parse(hasBool) }))
		invoke('read_file')
			.then((res) => setOptions((prevOptions) => ({ ...prevOptions, accArray: res as string[] })))
			.catch(() =>
				setOptions((prevOptions) => ({
					...prevOptions,
					msgArray: [...prevOptions.msgArray, "eCouldn't find any accounts saved."]
				}))
			)
		invoke('fetch_config')
			.then((cfg) => setOptions((prevOptions) => ({ ...prevOptions, config: cfg as Config })))
			.catch(() =>
				setOptions((prevOptions) => ({
					...prevOptions,
					msgArray: [...prevOptions.msgArray, "eCouldn't fetch configuration, using default config!"]
				}))
			)

		return () => {
			ctxServer.off('message')
		}
	}, [])

	return (
		<MotionConfig transition={{ type: 'spring' }}>
			<motion.div
				initial={{ y: '-110%' }}
				animate={{ y: 0 }}
				exit={{ y: '110%', transition: { delay: 0.1 } }}
				className="flex flex-col h-screen w-full items-center justify-center"
			>
				<div className="p-4 h-full w-full">
					<div className="h-full w-full bg-black rounded-3xl shadow-xl p-4 flex flex-col overflow-y-auto">
						<div className="fixed right-8 top-4">
							<motion.button
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.9 }}
								className={`p-4 rounded-full ${
									options.isRunning ? 'hover:bg-red-600 bg-red-900' : 'hover:bg-secondary bg-tertiary'
								} text-black my-4 transition-colors duration-300`}
								onClick={() =>
									setOptions((prevOptions) => {
										const newBool = !prevOptions.isRunning
										const newObj = { ...prevOptions, isRunning: newBool }

										localStorage.setItem('bool', JSON.stringify(newBool))
										newBool ? ctxServer.emit('run', newObj) : ctxServer.emit('stop')

										return newObj
									})
								}
							>
								{options.isRunning ? <FaSkull size={20} /> : <BsMinecartLoaded size={20} />}
							</motion.button>
						</div>
						{options.msgArray
							.slice()
							.reverse()
							.map((msg, index) => (
								<span
									className={`${msg.startsWith('i') ? 'text-lime-400' : 'text-red-600'} text-xl`}
									key={index}
								>
									{msg.substring(1)}
								</span>
							))}
					</div>
				</div>
			</motion.div>
		</MotionConfig>
	)
}

export default Home
