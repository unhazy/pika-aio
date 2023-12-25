/* eslint-disable node/no-unpublished-import */
import { MotionConfig, motion } from 'framer-motion'
import { unhazy } from '@/Assets'
import { FaInfo, FaDiscord, FaGithub, FaGlobe, FaCopyright } from 'react-icons/fa'
import { TbBrandMinecraft } from 'react-icons/tb'

const Info = () => {
	return (
		<MotionConfig transition={{ type: 'spring' }}>
			<motion.div
				initial={{ y: '-110%' }}
				animate={{ y: 0 }}
				exit={{ y: '110%', transition: { delay: 0.1 } }}
				className="flex flex-col h-screen w-full items-center text-secondary relative"
			>
				<div className="p-4 h-full w-full flex flex-col space-y-4">
					<div className="w-full bg-navbar rounded-3xl h-12 p-4 flex flex-row justify-between items-center">
						<div className="flex flex-row items-center space-x-2">
							<FaInfo size={20} />
							<h1 className="pointer-events-none font-bold text-xl">About</h1>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-4 h-full">
						<div className="flex items-center justify-center flex-col space-y-4 bg-navbar rounded-3xl">
							<img src={unhazy} alt="@unhazy" className="h-1/2" />
							<div className="flex flex-col items-center space-y-2">
								<motion.div
									initial={{ scale: 1 }}
									whileHover={{ scale: 1.2 }}
									className="flex flex-row items-center space-x-2 font-bold text-xl"
								>
									<span className="pointer-events-none">@unhazy</span>
								</motion.div>
								<div className="flex flex-row space-x-2 items-center">
									<FaDiscord size={24} />
									<FaGithub size={24} />
									<TbBrandMinecraft size={24} />
									<FaGlobe size={24} />
								</div>
							</div>
						</div>
						<div className="grid grid-rows-2 gap-4 h-full">
							<div className="bg-navbar rounded-3xl p-4 items-center text-center justify-center text-lg font-bold flex">
								<span className="pointer-events-none">
									Tool allowed as of release, not responsible for bans if rules change. If your
									accounts follow a pattern, create a forum ticket to whitelist them. <br />
									<br />
									For example:
									<br />
									Account1
									<br />
									Account2
									<br />
									Account3
								</span>
							</div>
							<div className="bg-navbar rounded-3xl p-4 items-center text-center justify-center text-lg font-bold flex flex-row space-x-2">
								<FaCopyright size={24} />
								<span className="pointer-events-none">MIT License Copyright [2023]</span>
							</div>
						</div>
					</div>
				</div>
			</motion.div>
		</MotionConfig>
	)
}

export default Info
