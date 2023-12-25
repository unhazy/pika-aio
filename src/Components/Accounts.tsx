/* eslint-disable node/no-unpublished-import */
import { invoke } from '@tauri-apps/api/tauri'
import { useState, useEffect } from 'react'
import { FaSearch, FaUserCog, FaRegEyeSlash, FaRegEye } from 'react-icons/fa'
import { MotionConfig, motion } from 'framer-motion'
import { steve } from '@Assets'

const Accounts = (): JSX.Element => {
	const [accArray, setArray] = useState<string[]>([''])
	const [searchQuery, setSearch] = useState<string>('')
	const [showPasswords, setPreference] = useState<boolean>(false)
	const [errObject, setObject] = useState({
		Read: false,
		Write: false,
		Delete: false
	})

	const handleSubmit = (e: React.KeyboardEvent<HTMLInputElement>): void => {
		const acc = e.currentTarget.value
		if (accArray.includes(acc)) return
		invoke('write_to_file', { accountStr: acc })
			.then(() => setArray((prevArray) => [...prevArray, acc]))
			.catch(() => setObject((prevObject) => ({ ...prevObject, Write: true })))
	}

	const handleDelete = (e: React.MouseEvent<HTMLLIElement, MouseEvent>): void => {
		const acc_ign = e.currentTarget.id
		invoke('remove_acc', { acc: acc_ign })
			.then(() => setArray((prevArray) => prevArray.filter((a) => a !== acc_ign)))
			.catch(() => setObject((prevObject) => ({ ...prevObject, Delete: true })))
	}

	const handleDisplay = (acc_str: string) => {
		const [acc, pw] = /:/.test(acc_str) ? acc_str.split(/:/) : [acc_str, null]
		return pw === null ? (
			<span>{acc}</span>
		) : (
			<div className="flex flex-col items-center justify-center">
				<span>{acc}</span>
				{showPasswords ? (
					<div className="flex flex-row text-xs">
						<span>Password:&nbsp;</span>
						<span>{pw}</span>
					</div>
				) : null}
			</div>
		)
	}

	useEffect(() => {
		invoke('read_file')
			.then((res) => setArray(res as string[]))
			.catch((err) => {
				if (!err.includes('The system cannot find the file specified.')) {
					setObject((prevObject) => ({ ...prevObject, Read: true }))
				} else {
					invoke('write_to_file', { accountStr: 'DefaultAccount' })
						.then(() => setArray((prevArray) => [...prevArray, 'DefaultAccount']))
						.catch(() => setObject((prevObject) => ({ ...prevObject, Write: true })))
				}
			})
	}, [])

	return (
		<motion.div
			initial={{ y: '-110%' }}
			animate={{ y: 0 }}
			exit={{ y: '110%', transition: { delay: 0.1 } }}
			transition={{ type: 'spring' }}
			className="w-full text-secondary"
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
				<div className="flex flex-col h-screen">
					<div className="m-4">
						<MotionConfig transition={{ type: 'spring' }}>
							<div className="bg-navbar p-4 rounded-3xl flex flex-row h-12 w-full justify-between items-center space-x-4">
								<FaSearch size={22} />
								<input
									className="bg-transparent w-full focus:outline-none"
									placeholder="Enter account ign (account:pass if not default pass)"
									autoComplete="off"
									maxLength={40}
									type="text"
									onChange={(e) => setSearch(e.target.value)}
									onKeyDown={(e) =>
										e.key.toUpperCase() === 'ENTER' &&
										e.currentTarget.value.length > 1 &&
										handleSubmit(e)
									}
								/>
								<motion.div
									initial={{ scale: 1 }}
									whileHover={{ scale: 1.2 }}
									onClick={() => setPreference((oldPreference) => !oldPreference)}
									className="hover:cursor-pointer"
									whileTap={{ scale: 0.9 }}
								>
									{showPasswords ? <FaRegEye size={24} /> : <FaRegEyeSlash size={24} />}
								</motion.div>
							</div>
						</MotionConfig>
					</div>
					<div className="mx-4 overflow-y-auto scroll-smooth" id="account">
						<div className="w-full flex-1">
							<ul className="grid grid-cols-4">
								<MotionConfig transition={{ type: 'just' }}>
									{accArray
										.filter((account) =>
											searchQuery === ''
												? account.length > 0
												: account.toLowerCase().includes(searchQuery.toLowerCase())
										)
										.map((account, index) => (
											<motion.li
												className="relative overflow-hidden hover:cursor-pointer font-bold text-xl h-96 w-48 bg-navbar flex flex-col rounded-3xl mb-2 items-center justify-center space-y-4 p-4"
												key={index}
												id={account}
												variants={{ hover: { scale: 0.95 } }}
												whileHover="hover"
												initial="initial"
												onClick={(e) => handleDelete(e)}
											>
												<motion.div
													variants={{ initial: { opacity: 0 }, hover: { opacity: 0.5 } }}
													className="absolute top-0 left-0 bg-red-600 w-full h-full"
												/>
												<img
													className="h-3/4"
													src={`https://visage.surgeplay.com/full/384/${
														/:/.test(account) ? account.split(/:/)[0] : account
													}`}
													alt="SkinRender"
													onErrorCapture={(e) => (e.currentTarget.src = steve)}
												/>
												{handleDisplay(account)}
											</motion.li>
										))}
								</MotionConfig>
							</ul>
						</div>
					</div>
				</div>
			)}
		</motion.div>
	)
}

export default Accounts
