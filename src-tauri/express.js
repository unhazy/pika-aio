import mineflayer from 'mineflayer'
import express from 'express'
import { Server } from 'socket.io'
import { createServer } from 'http'

// ┏┓┏┓┳┓┏┓┏┳┓┏┓┳┓┏┳┓┏┓
// ┃ ┃┃┃┃┗┓ ┃ ┣┫┃┃ ┃ ┗┓
// ┗┛┗┛┛┗┗┛ ┻ ┛┗┛┗ ┻ ┗┛

/**
 * Array of ips used to connect to the server.
 *
 * @constant
 */
const hostArray = [
	'pika.host',
	'pika-network.net',
	'proxy001.pikasys.net',
	'proxy002.pikasys.net',
	'proxy003.pikasys.net',
	'proxy004.pikasys.net',
	'proxy005.pikasys.net'
]

/**
 * Contains items that are to be gifted as they are considered to be valuable.
 *
 * @constant
 */
const whitelisted = [
	'CRATE',
	'TREASURE',
	'SPECIAL',
	'GKIT CONTAINER',
	'CLASS CONTAINER',
	'ELF',
	'BOOSTER',
	'SCROLLS VOUCHER',
	'PICKAXE BOX'
]

/**
 * Represents a mapping of frontend values to their corresponding full forms for acronyms.
 *
 * @constant
 */
const modeMap = {
	opp: 'opprison',
	opsb: 'opskyblock',
	opf: 'opfactions',
	kpvp: 'kit-pvp'
}

/**
 * Represents a mapping of quit keys to their corresponding messages.
 *
 * @constant
 */
const quitMap = {
	'quit.spawn': 'Bot respawned, relogging.',
	'quit.destroy': 'Instance destroyed successfully.',
	'quit.success': 'Done. Disconnecting.',
	'quit.window': 'Could not find confirmation in window, lag maybe? Retrying.',
	'quit.cooldown': 'On cooldown, try again later.',
	socketClosed: 'Connection closed abrubtly, retrying.'
}

/**
 * Array containing reasons for bot to reconnect.
 *
 * @constant
 */
const relogArray = ['quit.window', 'quit.spawn', 'socketClosed']

/**
 * Array of account names that are currently being processed or have been processed.
 *
 * @constant
 * @type {Bot[]}
 */
const procAccs = []

/**
 * Regular expression for stripping Minecraft color codes (§) from a string.
 *
 * @constant
 */
const stripRegex = /\u00A7[\dA-Z]/gi

/**
 * Removes formatting codes from a given string.
 *
 * @param {string} str The input string containing formatting codes.
 * @returns {string} The input string with formatting codes removed.
 */
const stripFormatting = (str) => str.replace(stripRegex, '')

/**
 * Flag indicating whether the process should be killed.
 */
let stopFlag = false

// ┏┳┓┓┏┏┓┳┳┓┏┓┏┓
//  ┃ ┗┫┃┃┃┃┃┃┓┗┓
//  ┻ ┗┛┣┛┻┛┗┗┛┗┛

/**
 * @typedef {object} ArgsReceived
 * @property {boolean} isRunning - Whether the script is running.
 * @property {string[]} accArray - Array of accounts to use for the script.
 * @property {string[]} msgArray - Array of messages to be displayed on the GUI console.
 * @property {Configuration} config - Configuration settings for the script.
 */

/**
 * @typedef {object} Configuration
 * @property {string} ign - Ign of the main player to gift items to.
 * @property {string} pass - Default password of accounts to use for the script, unless explicitly specified.
 * @property {'opp' | 'opsb' | 'opf' | 'kpvp'} mode - Modes allowed.
 * @property {boolean} kit_module - Whether to use the kit collection module.
 * @property {boolean} collect_once - Whether to collect once kits.
 * @property {boolean} main_online - Whether to keep main online while gifting gkits.
 * @property {boolean} first_join - Whether it is the first join of alts.
 * @property {boolean} is_async - Whether the script should be run asynchronously or not.
 * @property {boolean} is_afk - Whether the script should be run to AFK alts.
 */

/**
 * @typedef {object} Kick
 * @property {string} text Contains the string explaining the reason the bot was kicked.
 * @property {Kick[]} extra Any extra information about the kick is stored in this array of objects.
 */

// ┓ ┏┓┏┓┳┏┓
// ┃ ┃┃┃┓┃┃
// ┗┛┗┛┗┛┻┗┛

const sv = new Server(createServer(express), { cors: { origin: '*', methods: ['GET'] } })
sv.listen(8080)

sv.on('connection', (socket) => {
	// TODO: Add logic for connection failure / success.

	socket.on('run', async (/** @type {ArgsReceived} */ args) => {
		stopFlag = false
		sv.send('i[CONSOLE] Starting.')

		const formattedArray = args.accArray.filter((acc) => acc !== '')

		if (args.config.main_online) {
			procAccs.push(new Bot(args.config.ign, args.config.pass, { ...args.config, is_afk: true }))
			await new Promise((res) => setTimeout(res, 2000))
		}

		for (const account of formattedArray) {
			if (stopFlag) break

			let fUser = account.trim().replace(/\r/g, '')
			let fPass = args.config.pass

			if (/:/.test(fUser)) [fUser, fPass] = fUser.split(/:/)

			if (args.config.is_async || args.config.is_afk) {
				procAccs.push(new Bot(fUser, fPass, args.config))
				await new Promise((res) => setTimeout(res, 2000))
			} else {
				const botptr = new Bot(fUser, fPass, args.config)
				procAccs.push(botptr)
				await botptr.resolveDisconnect()
			}
		}
	})

	socket.on('stop', () => {
		stopFlag = true
		sv.send('e[CONSOLE] Stopped.')
		procAccs.forEach((acc) => acc.destroy())
		procAccs.length = 0
	})
})

// ┏┓┓ ┏┓┏┓┏┓┏┓┏┓
// ┃ ┃ ┣┫┗┓┗┓┣ ┗┓
// ┗┛┗┛┛┗┗┛┗┛┗┛┗┛

class Bot {
	/** @type {string} */
	#username
	/** @type {string} */
	#password
	/** @type {Configuration} */
	#config
	/** @type {string} */
	#strptr
	#host = hostArray[Math.floor(Math.random() * hostArray.length)]
	/** @type {() => void} */
	#resolveConnection
	#spawns = 0
	#finished = false
	#hasPrevious = false
	#upgradeCheck = false
	#relogFlag = false
	/** @type {mineflayer.Bot} */
	#bot

	/**
	 * Creates a new instance of the Bot class.
	 *
	 * @class
	 * @classdesc Represents a manager for the bot instance.
	 *
	 * @param {string} username The username of the bot.
	 * @param {string} password The password of the bot.
	 * @param {Configuration} config Configuration object containing configuration information.
	 *
	 * @throws {Error} Throws an error if the required parameters are missing or if the type is mismatched.
	 *
	 * @see {@link Configuration}
	 * @example
	 * // Usage Example:
	 * const bot = new Bot('user', 'password', configObject);
	 */
	constructor(username, password, config) {
		this.#username = username
		this.#password = password
		this.#config = config

		this.#initBot()
	}

	/**
	 * Asynchronously resolves the disconnect event by returning a promise that resolves
	 * when the connection is successfully disconnected.
	 *
	 * This method is useful for handling asynchronous disconnect scenarios, and it allows
	 * you to await the resolution of the disconnect event.
	 *
	 * @method
	 * @async
	 * @returns {Promise<void>} A Promise that resolves when the disconnect is resolved.
	 *
	 * @example
	 * // Run next bot after one disconnects:
	 * new Bot(parameters).resolveDisconnect().then(() => new Bot(parameters))
	 */
	async resolveDisconnect() {
		return await new Promise((res) => {
			this.#resolveConnection = () => res()
		})
	}

	/**
	 * Formats a string by inserting a user identifier at a specific position.
	 *
	 * @private
	 * @method
	 * @param {string} str The original string to be formatted.
	 */
	#formatSend(str) {
		sv.send(`${str.charAt(0)}[${this.#username}] ${str.substring(1)}`)
	}

	/**
	 * Checks if the bot's inventory contains whitelisted items.
	 *
	 * @private
	 * @method
	 * @returns {any[]} An array of whitelisted items (if any).
	 */
	#hasItems() {
		return this.#bot.inventory
			.items()
			.filter(
				(item) =>
					item.customName &&
					whitelisted.some((iw) => stripFormatting(item.customName).toUpperCase().includes(iw.toUpperCase()))
			)
	}

	/**
	 * Checks whether the given string has upgrade present.
	 *
	 * [Why not pass the item object? Because it requires another dependency (item-prismarine)]
	 *
	 * @private
	 * @param {string | null} name String representation of the item's name.
	 * @returns {boolean} True if the string has upgrade present.
	 */
	#hasUpgrade(name) {
		return name?.toUpperCase().includes('UPGRADE')
	}

	/**
	 * Initializes the bot instance.
	 *
	 * @method
	 * @private
	 */
	#initBot() {
		this.#bot = mineflayer.createBot({
			username: this.#username,
			host: this.#host,
			version: '1.12',
			auth: 'offline',
			hideErrors: true
		})

		this.#initEvents()
	}

	/**
	 * Initializes the bot's events listeners and sets appropriate handlers.
	 *
	 * @method
	 * @private
	 */
	#initEvents() {
		/**
		 * Emitted when the bot is spawned.
		 */
		this.#bot.on('spawn', () => {
			this.#spawns++

			switch (this.#spawns) {
				case 1:
					this.#formatSend('iAwaiting Authentication.')
					this.#bot.chat(`/login ${this.#password}`)
					break
				case 2:
					this.#formatSend('iLogged in successfully!')
					this.#bot.chat(`/server ${modeMap[this.#config.mode]}`)
					break
				case 3:
					this.#formatSend(`iJoined ${modeMap[this.#config.mode]}!`)
					if (this.#config.is_afk) {
						this.#formatSend('iAFK.')
						this.#bot.removeAllListeners('windowOpen').removeAllListeners('windowClose')
					} else {
						if (this.#hasItems().length > 0) {
							this.#formatSend('iContains valuables, gifting.')
							this.#hasPrevious = true
							this.#bot.chat(`/gift ${this.#config.ign}`)
						} else {
							this.#bot.chat('/ci')
							if (this.#config.mode === 'opsb' || this.#config.mode === 'opf') {
								// OPSB requires confirmation command twice
								this.#config.mode === 'opsb' && this.#bot.chat('/ci')
								this.#bot.chat('/gkit')
							}
						}
					}
					break
				default:
					this.#bot.quit('quit.spawn')
					break
			}
		})

		/**
		 * Emitted when a window is opened on the bot.
		 */
		this.#bot.on('windowOpen', async (window) => {
			const windowTitle = window.title.toUpperCase()

			if (windowTitle.includes('UPGRADE')) {
				const upgrade = window.containerItems().find((item) => {
					return item.customLore?.some((/** @type {string} */ lore) => {
						const match = lore.match(/\((\d)\/(\d)\)/)
						if (!match || match.length !== 3) return false
						return parseInt(match[1]) === parseInt(match[2])
					})
				})

				if (!upgrade) {
					this.#formatSend('iNothing left to upgrade, collecting gkits.')
					this.#upgradeCheck = true
					this.#bot.closeWindow(window)
				} else this.#bot.clickWindow(upgrade.slot, 0, 0)
			} else if (windowTitle.includes('GKIT SELECTOR') || windowTitle.includes('CLASSES')) {
				const slot = window.containerItems().find((item) => {
					return this.#upgradeCheck || this.#config.mode === 'kpvp'
						? item.customLore?.some((/** @type {string} */ lore) =>
								['CAN CLAIM', 'TO REDEEM'].some((str) => lore.toUpperCase().includes(str.toUpperCase()))
						  )
						: this.#hasUpgrade(item.customName)
				})

				if (slot) {
					await this.#bot.clickWindow(slot.slot, 0, 0)
					if (!slot.customName || !this.#hasUpgrade(slot.customName))
						this.#formatSend(`iCollected ${stripFormatting(slot.customName).toLowerCase()} gkit!`)
				} else {
					this.#finished = true
					this.#hasItems().length > 0 ? this.#bot.closeWindow(window) : this.#bot.quit('quit.cooldown')
				}
			} else if (windowTitle.includes('SELECT ITEMS TO SEND')) {
				const filtered = window
					.items()
					.filter(
						(item) =>
							item.customName &&
							whitelisted.some((iw) =>
								stripFormatting(item.customName).toUpperCase().includes(iw.toUpperCase())
							)
					)

				for (const item of filtered) {
					await this.#bot.clickWindow(item.slot, 0, 1)
				}
				this.#bot.closeWindow(window)
			} else if (windowTitle.includes('ARE YOU SURE?')) {
				const confirm = window
					.containerItems()
					.find(
						(item) =>
							item.customName?.toUpperCase().includes('CONFIRM') ||
							(this.#hasUpgrade(item.customName) && !item.customName?.toUpperCase().includes('CANCEL'))
					)

				if (confirm) {
					this.#bot.clickWindow(confirm.slot, 0, 0)
					this.#strptr = this.#hasUpgrade(confirm.customName)
						? `iUpgraded ${stripFormatting(
								confirm.customName.replace(/upgrade/i, '').trim()
						  )} gkit successfully!`
						: 'iGifted successfully!'
				} else this.#bot.quit('quit.window')
			} else if (windowTitle.includes('CLEAR INVENTORY')) {
				const accept = window.containerItems().find((item) => item.customName?.toUpperCase().includes('ACCEPT'))

				if (accept) {
					this.#bot.clickWindow(accept.slot, 0, 0)
				} else this.#bot.quit('quit.window')
			}
		})

		/**
		 * Emitted when a window is closed on the bot.
		 */
		this.#bot.on('windowClose', async (window) => {
			const windowTitle = window.title.toUpperCase()

			if (windowTitle.includes('GKIT SELECTOR') || windowTitle.includes('CLASSES')) {
				await this.#bot.waitForTicks(16)
				this.#finished ? this.#bot.chat(`/gift ${this.#config.ign}`) : this.#bot.chat('/gkit')
			} else if (windowTitle.includes('ARE YOU SURE?')) {
				this.#formatSend(this.#strptr)
				await this.#bot.waitForTicks(16)

				if (this.#strptr.includes('iUpgraded')) {
					this.#bot.chat('/gkit')
				} else if (this.#hasPrevious) {
					this.#hasPrevious = false
					this.#bot.chat('/ci')
				} else {
					this.#bot.quit('quit.success')
				}
			} else if (windowTitle.includes('CLEAR INVENTORY')) {
				await this.#bot.waitForTicks(30)
				this.#bot.chat('/gkit')
			}
		})

		/**
		 * Emitted when the bot disconnects.
		 */
		this.#bot.on('end', (reason) => {
			if (!(this.#config.is_async || this.#config.is_afk || reason in relogArray)) this.#resolveConnection()

			this.#bot.removeAllListeners()
			if (!(reason in relogArray)) this.#bot = null

			if (reason in quitMap) {
				this.#formatSend(`${reason === 'quit.success' ? 'i' : 'e'}${quitMap[reason]}`)
				if (reason in relogArray) this.#relog()
			} else if (reason !== 'disconnect.quitting') {
				this.#formatSend(`eUnhandled disconnection, reason: ${reason}`)
				this.#relog()
			}
		})

		/**
		 * Emitted when the bot is kicked from the server.
		 */
		this.#bot.on('kicked', (reason) => {
			/** @type {Kick} */
			const parsed = JSON.parse(reason)

			parsed.text.trim() === ''
				? this.#formatSend(
						`e${parsed.extra
							.filter((obj) => obj.text.length >= 5)
							.map((obj) => stripFormatting(obj.text).replace(/[\r\n]+/g, ''))
							.join(' ')}`
				  )
				: this.#formatSend(`e${stripFormatting(parsed.text)}`)
		})
	}

	/**
	 * Relogs the bot by resetting the defaults and initializing it after a delay.
	 *
	 * @method
	 * @private
	 * @async
	 */
	async #relog() {
		this.#relogFlag = true
		this.#spawns = 0
		this.#finished = false
		this.#hasPrevious = false
		await new Promise((res) => setTimeout(res, 2000)).then(() => {
			this.#relogFlag && this.#initBot(), (this.#relogFlag = false)
		})
	}

	/**
	 * Destroys the bot instance, optionally resetting the relog flag if a relog is being queued.
	 *
	 * @method
	 */
	destroy() {
		this.#relogFlag ? (this.#relogFlag = false) : this.#bot && this.#bot.quit('quit.destroy')
	}
}
