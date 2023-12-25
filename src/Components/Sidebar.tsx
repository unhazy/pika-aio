/* eslint-disable node/no-unpublished-import */
import { icon } from '@Assets'
import { motion, MotionConfig } from 'framer-motion'
import { FaHome, FaCog, FaUser, FaBook } from 'react-icons/fa'
import { useState, createContext, useContext, Dispatch, SetStateAction } from 'react'
import { NavLink } from 'react-router-dom'
import { v4 } from 'uuid'

// @ts-expect-error -- Will deal with later. (https://github.com/DefinitelyTyped/DefinitelyTyped/pull/24509#issuecomment-382213106)
const SidebarContext = createContext<{ current: string; setCurrent: Dispatch<SetStateAction<string>> }>()

const Sidebar = (): JSX.Element => {
	const [current, setCurrent] = useState<string>('Home')
	return (
		<aside className="h-screen w-44">
			<nav className="relative h-full flex flex-col bg-navbar border-r border-primary shadow-sm">
				<MotionConfig transition={{ type: 'spring' }}>
					<div className="group flex-col p-4 pb-2 flex justify-between items-center">
						<motion.span
							whileHover={{ scale: 1.1 }}
							className="text-3xl font-bold text-tertiary group-hover:text-secondary transition-colors duration-300 group-hover:cursor-default"
						>
							PIKA-AIO
						</motion.span>
						<span className="text-base text-tertiary group-hover:text-secondary transition-colors duration-300 group-hover:cursor-default">
							@unhazy
						</span>
					</div>

					<SidebarContext.Provider value={{ current, setCurrent }}>
						<ul className="mt-4 flex-1">
							<SidebarItem icon={<FaHome />} text="Home" />
							<SidebarItem icon={<FaUser />} text="Accounts" />
							<SidebarItem icon={<FaCog />} text="Settings" />
							<SidebarItem icon={<FaBook />} text="Info" />
						</ul>
					</SidebarContext.Provider>

					<motion.div
						initial={{ y: 150 }}
						animate={{ y: 0 }}
						whileTap={{ y: 150 }}
						className="absolute bottom-0 flex justify-center w-full"
					>
						<img src={icon} alt="Logo" className="w-32 opacity-30 transform translate-y-1/4" />
					</motion.div>
				</MotionConfig>
			</nav>
		</aside>
	)
}

const SidebarItem = ({ icon, text }: { icon: JSX.Element; text: string }): JSX.Element => {
	const { current, setCurrent } = useContext(SidebarContext)

	return (
		<NavLink to={text === 'Home' ? '/' : text} key={v4()}>
			<li className="flex w-44" onClick={() => setCurrent(text)}>
				<motion.div
					whileHover={{ scale: 1.05 }}
					className={`flex w-full mx-3 items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors duration-300 ${
						current === text
							? 'bg-primary text-secondary'
							: 'hover:bg-primary hover:text-secondary text-tertiary'
					}`}
				>
					<div className="w-4">{icon}</div>
					<span className="mx-3">{text}</span>
				</motion.div>
			</li>
		</NavLink>
	)
}

export default Sidebar
