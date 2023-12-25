/* eslint-disable node/no-unpublished-import */
import { invoke } from '@tauri-apps/api/tauri'
import { motion, MotionConfig } from 'framer-motion'
import {
	FaCog,
	FaUser,
	FaLock,
	FaTree,
	FaRunning,
	FaCheck,
	FaBullhorn,
	FaGift,
	FaInfoCircle,
	FaUserCog
} from 'react-icons/fa'
import { GiVibratingShield, GiMiner, GiSwordClash, GiNightSleep, GiSwordSlice, GiAbdominalArmor } from 'react-icons/gi'
import { Settings as Config, defaultSettings } from '@/exports'
import { useState, useContext, createContext, Dispatch, SetStateAction, useEffect } from 'react'

// @ts-expect-error -- Will deal with later. (https://github.com/DefinitelyTyped/DefinitelyTyped/pull/24509#issuecomment-382213106)
const SettingsContext = createContext<{ config: Config; setConfig: Dispatch<SetStateAction<Config>> }>()

const Settings = (): JSX.Element => {
	const [config, setConfig] = useState<Config>(defaultSettings)
	const [isInit, setInit] = useState(false)
	const [errObject, setObject] = useState({
		Fetch: false,
		Edit: false
	})

	useEffect(() => {
		if (isInit) {
			invoke('edit_config', { edit: config }).catch(() =>
				setObject((prevObject) => ({ ...prevObject, Edit: true }))
			)
		} else {
			setInit(true)
			invoke('fetch_config')
				.then((cfg) => setConfig(cfg as Config))
				.catch(() => setObject((prevObject) => ({ ...prevObject, Fetch: true })))
		}
	}, [config])

	return (
		<MotionConfig transition={{ type: 'spring' }}>
			<motion.div
				initial={{ y: '-110%' }}
				animate={{ y: 0 }}
				exit={{ y: '110%', transition: { delay: 0.1 } }}
				className="flex flex-col h-screen w-full items-center text-secondary"
			>
				{Object.keys(errObject).some((k) => errObject[k as keyof typeof errObject] === true) ? (
					<div className="flex-col items-center justify-center h-screen flex space-y-4">
						<FaUserCog size={32} />
						<div className="flex-col flex items-center justify-center font-bold text-lg">
							<span>An error has occured while operating accounts</span>
							<span>
								Error:{' '}
								{Object.keys(errObject)
									.filter((k) => errObject[k as keyof typeof errObject] === true)
									.join(', ')}
							</span>
						</div>
					</div>
				) : (
					<div className="p-4 w-full space-y-4">
						<div className="w-full bg-navbar rounded-3xl h-12 p-4 flex flex-row justify-between items-center">
							<div className="flex flex-row items-center space-x-2">
								<motion.div
									className="cursor-pointer"
									initial={{ scale: 1, rotate: 0 }}
									whileHover={{ scale: 1.2, rotate: 90 }}
									onClick={() => setConfig(defaultSettings)}
								>
									<FaCog size={20} />
								</motion.div>
								<h1 className="pointer-events-none font-bold text-xl">Settings</h1>
							</div>
						</div>
						<div>
							<ul className="grid w-full grid-cols-4 gap-2 mt-4">
								<SettingsContext.Provider value={{ config, setConfig }}>
									<RenderRadio
										icon={<GiMiner size={20} />}
										id="opp"
										header="OP Prison"
										desc="Mining, ranking, and escaping in a confined world."
									/>
									<RenderRadio
										icon={<FaTree size={20} />}
										id="opsb"
										header="OP Skyblock"
										desc="Custom islands, challenges, and much more."
									/>
									<RenderRadio
										icon={<GiVibratingShield size={20} />}
										id="opf"
										header="OP Factions"
										desc="Competitive PvP, raiding, and faction warfare."
									/>
									<RenderRadio
										icon={<GiSwordClash size={20} />}
										id="kpvp"
										header="KitPvP"
										desc="Strategic PvP with unique kits in fast paced battles."
									/>
								</SettingsContext.Provider>
							</ul>
						</div>
						<div className="grid grid-cols-2 grid-rows-3 h-50 gap-x-2 gap-y-2 justify-between">
							<SettingsContext.Provider value={{ config, setConfig }}>
								<RenderInput icon={<FaUser size={20} />} id="ign" placeholder="Main Account" />
								<RenderInput icon={<FaLock size={20} />} id="pass" placeholder="Default Password" />
								<RenderCheck
									icon={<FaRunning size={20} />}
									label="Concurrent?"
									id="is_async"
									hover="Runs multiple bots at once, only recommended with faster connections."
								/>
								<RenderCheck
									icon={<FaBullhorn size={20} />}
									label="First Join?"
									id="first_join"
									hover="Toggle this when your alts will be welcomed on join, for a slower join rate."
									right
								/>
								<RenderCheck
									icon={<FaGift size={20} />}
									label="Gift Security?"
									id="main_online"
									hover="Should it afk the main account when collecting to make sure the gifts are not sent to someone with a similar name? (Will use default password)"
								/>
								<RenderCheck icon={<GiNightSleep size={20} />} label="AFK" id="is_afk" />
							</SettingsContext.Provider>
						</div>
						<div className="pt-10 text-xl text-center items-center font-bold justify-center flex space-x-2">
							<GiSwordSlice size={20} />
							<span>Kit Module Config (Coming Soon)</span>
						</div>
						<div className="space-y-2">
							<SettingsContext.Provider value={{ config, setConfig }}>
								<RenderCheck icon={<FaCheck size={20} />} label="Toggled?" id="kit_module" />
								<RenderCheck
									icon={<GiAbdominalArmor size={20} />}
									label="Once kits?"
									id="collect_once"
								/>
							</SettingsContext.Provider>
						</div>
						<div>
							<span className="fixed text-sm bottom-4 right-4">play.pika-network.net</span>
						</div>
					</div>
				)}
			</motion.div>
		</MotionConfig>
	)
}

const RenderInput = ({
	icon,
	placeholder,
	id
}: {
	icon: JSX.Element
	placeholder: string
	id: 'ign' | 'pass'
}): JSX.Element => {
	const { config, setConfig } = useContext(SettingsContext)

	return (
		<div className={'h-16 bg-navbar rounded-full py-4 px-6'}>
			<div className="w-full flex flex-row items-center justify-center h-full space-x-4">
				{icon}
				<input
					className="w-full focus:outline-none bg-transparent justify-center h-full text-center text-lg"
					placeholder={placeholder}
					type={id === 'pass' ? 'password' : 'text'}
					autoComplete="off"
					value={config[id]}
					onChange={(e) => setConfig((prevConfig) => ({ ...prevConfig, [id]: e.target.value }))}
					onBlur={(e) => id === 'pass' && (e.target.type = 'password')}
					onFocus={(e) => id === 'pass' && (e.target.type = 'text')}
				/>
			</div>
		</div>
	)
}

const RenderCheck = ({
	icon,
	label,
	id,
	hover,
	right
}: {
	icon: JSX.Element
	label: string
	id: keyof Config
	hover?: string
	right?: boolean
}): JSX.Element => {
	const { config, setConfig } = useContext(SettingsContext)

	return (
		<div className="h-16 bg-navbar rounded-full py-4 px-6">
			<div className="w-full flex flex-row items-center justify-center h-full space-x-4">
				{icon}
				<div className="w-full justify-between flex items-center">
					<div className="flex flex-row items-center space-x-2">
						<span>{label}</span>
						{hover && (
							<motion.div
								initial="initial"
								whileHover="whileHover"
								className="relative flex items-center"
							>
								<FaInfoCircle size={16} />
								<motion.span
									variants={{
										initial: { opacity: 0, x: right ? 32 : -32 },
										whileHover: { opacity: 1, x: 0 }
									}}
									className={`z-10 absolute max-w-[32rem] w-max pointer-events-none ${
										right ? 'text-xs right-0' : 'text-xs'
									} m-6 bg-primary p-2 rounded-lg shadow-md`}
								>
									{hover}
								</motion.span>
							</motion.div>
						)}
					</div>
					<div
						className={`${
							config[id] ? 'bg-secondary justify-end' : 'bg-red-600 justify-start'
						} p-1 rounded-full w-12 flex cursor-pointer transition-colors duration-300`}
						onClick={() => setConfig((prevConfig) => ({ ...prevConfig, [id]: !config[id] }))}
					>
						<motion.div layout className="bg-white rounded-full w-4 h-4" />
					</div>
				</div>
			</div>
		</div>
	)
}

const RenderRadio = ({
	icon,
	id,
	header,
	desc
}: {
	icon: JSX.Element
	id: Config['mode']
	header: string
	desc: string
}): JSX.Element => {
	const { config, setConfig } = useContext(SettingsContext)

	return (
		<li>
			<input
				type="radio"
				id={id}
				name="servertype"
				className="hidden peer"
				checked={config.mode === id}
				onChange={() => setConfig((prevConfig) => ({ ...prevConfig, mode: id }))}
			/>
			<label
				htmlFor={id}
				className="inline-flex items-center justify-between w-full p-5 transition-all ease-linear bg-navbar border-2 border-primary rounded-3xl cursor-pointer hover:bg-primary hover:border-secondary peer-checked:border-secondary peer-checked:bg-primary"
			>
				<div className="block">
					<div className="flex mb-2 w-full justify-center items-center">{icon}</div>
					<div className="flex text-center justify-center w-full text-lg font-semibold">{header}</div>
					<div className="flex text-center justify-center w-full text-sm">{desc}</div>
				</div>
			</label>
		</li>
	)
}

export default Settings
