import * as sdk from 'matrix-js-sdk'
import { logger } from 'matrix-js-sdk/lib/logger'
import { ClientEvent } from 'matrix-js-sdk'
import { LocalStorage } from 'node-localstorage'
import { LocalStorageCryptoStore } from 'matrix-js-sdk/lib/crypto/store/localStorage-crypto-store'
import dotenv from 'dotenv'
import chalk from 'chalk'
import moment from 'moment'

import { Calendar } from '../database/Calendar'
import { summary } from './notifications'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Olm = require('olm/olm_legacy')
declare global {
	// eslint-disable-next-line no-var
	var Olm: unknown
}
global.Olm = Olm
const localStorage = new LocalStorage('./store/matrix')
dotenv.config()

/**
 * A wrapper for matrix-js-sdk,
 * which allows to connect to a Matrix account, enables encryption
 *     connect()
 * gives a message sending, reminder and congratulation function
 *     sendMessage()
 *     sendReminder()
 *     sendCongratulation()
 * as well as a disconnection function (that then stop the client).
 *     disconnect()
 */
export class MatrixNotifications {
	matrixClient: sdk.MatrixClient
	connected: boolean

	/**
	 * Check that the instane enable MATRIX via environement variables,
	 * then create the client
	 */
	constructor() {
		this.connected = false
		// temp fix : https://github.com/matrix-org/matrix-js-sdk/issues/2415#issuecomment-1141246410
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const request = require('request')
		sdk.request(request)
		///

		if (process.env.MATRIX_USER == undefined || process.env.MATRIX_USER == '') {
			console.log(chalk.red('Please add a MATRIX_USER in your .env'))
			process.exit(1)
		}
		if (process.env.MATRIX_TOKEN == undefined || process.env.MATRIX_TOKEN == '') {
			console.log(chalk.red('Please add a MATRIX_TOKEN in your .env'))
			process.exit(1)
		}
		if (process.env.MATRIX_URL == undefined || process.env.MATRIX_URL == '') {
			console.log(chalk.red('Please add a MATRIX_URL in your .env'))
			process.exit(1)
		}

		this.matrixClient = sdk.createClient({
			deviceId: 'Streaks Server',
			baseUrl: process.env.MATRIX_URL,
			accessToken: process.env.MATRIX_TOKEN,
			userId: process.env.MATRIX_USER,

			cryptoStore: new LocalStorageCryptoStore(localStorage)
		})
	}

	/**
	 * Connect the client and start encryption
	 */
	async connect() {
		if (this.connected)
			return
		logger.setLevel(logger.levels.ERROR)
		await this.matrixClient.initCrypto()
		await this.matrixClient.startClient()
		await new Promise<void>((resolve) => {
			this.matrixClient.once(ClientEvent.Sync, () => {
				// Send encrypted message, even if member isn't trusted
				this.matrixClient.setGlobalErrorOnUnknownDevices(false)
				this.connected = true
				resolve()
			})
		})
	}

	/**
	 * Stop the client if it is started
	 */
	disconnect() {
		if (!this.connected)
			return
		this.matrixClient.stopClient()
	}

	/**
	 * Send a message in the given room
	 * First join the room if not already done
	 *
	 * @param {string} roomID - The id of the room to send the message to.
	 * @param {string} message - The message to send
	 * @param {string} [htmlMessage] - The HTML version of the message
	 */
	async sendMessage(roomID: string, message: string, htmlMessage = '') {
		await this.matrixClient.joinRoom(roomID)
		await this.matrixClient.uploadKeys()
		if (htmlMessage != '')
			await this.matrixClient.sendHtmlMessage(roomID, message, htmlMessage)
		else
			await this.matrixClient.sendTextMessage(roomID, message)
	}

	/**
	 * Send a reminder in the given room
	 * Don't send the reminder if the summary is empty or if every tasks are successful
	 *
	 * @param {string} roomID - The id of the room to send the message to.
	 * @param {summary} sum - The summary, with every tasks, their name, state and current streaks
	 */
	async sendReminder(roomID: string, sum: summary) {
		if (sum.length == 0)
			return

		let message = `⏰ ${moment().format('HH:mm')}, You still have work to do!`
		let htmlMessage = `⏰ <strong>${moment().format('HH:mm')}</strong>, You still have work to do!`

		for (let s = 0; s < sum.length; s++) {
			if (sum[s].fail) {
				message += `\n      🔴 ${sum[s].name}  ${sum[s].streaks} 🔥`
				htmlMessage += `<br>&emsp;&emsp;🔴 <strong>${sum[s].name}</strong>&ensp;${sum[s].streaks} 🔥`
			}
			else {
				message += `\n      🟢 ${sum[s].name}  ${sum[s].streaks} 🔥`
				htmlMessage += `<br>&emsp;&emsp;🟢 <strong>${sum[s].name}</strong>&ensp;${sum[s].streaks} 🔥`
			}
		}

		await this.sendMessage(roomID, message, htmlMessage)
	}

	/**
	 * Send a congratulation in the given room for the given calendar
	 *
	 * @param {string} roomID - The id of the room to send the message to.
	 * @param {Calendar} calendar - The calendar concerned by the congrats
	 */
	async sendCongratulation(roomID: string, calendar: Calendar) {
		const message = `🟢 ${calendar.name?.toUpperCase()} {${calendar.countStreaks()}🔥}  Task completed!`
		const htmlMessage = `🟢 <strong>${calendar.name?.toUpperCase()}</strong> {${calendar.countStreaks()}🔥}  Task completed!`
		await this.sendMessage(roomID, message, htmlMessage)
	}

	/**
	 * Send the message "🎉 All the streaks are done!! 🎉"
	 * in the given room
	 *
	 * @param {string} roomID - The id of the room to send the message to.
	 */
	async sendStreaksDone(roomID: string) {
		const message = '🎉 All the streaks are done!! 🎉'
		const htmlMessage = '🎉 <strong>All the streaks are done!!</strong> 🎉'
		await this.sendMessage(roomID, message, htmlMessage)
	}
}
