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

export class MatrixNotifications {
	matrixClient: sdk.MatrixClient
	connected: boolean

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

	disconnect() {
		if (!this.connected)
			return
		this.matrixClient.stopClient()
	}

	async sendMessage(roomID: string, message: string, htmlMessage = '') {
		await this.matrixClient.joinRoom(roomID)
		await this.matrixClient.uploadKeys()
		if (htmlMessage != '')
			await this.matrixClient.sendHtmlMessage(roomID, message, htmlMessage)
		else
			await this.matrixClient.sendTextMessage(roomID, message)
	}

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

	async sendCongratulation(roomID: string, calendar: Calendar) {
		const message = `🟢 ${calendar.name?.toUpperCase()} {${calendar.countStreaks()}🔥}  Task completed!`
		const htmlMessage = `🟢 <strong>${calendar.name?.toUpperCase()}</strong> {${calendar.countStreaks()}🔥}  Task completed!`
		await this.sendMessage(roomID, message, htmlMessage)
	}
}
