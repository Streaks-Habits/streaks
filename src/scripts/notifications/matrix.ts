import * as sdk from 'matrix-js-sdk'
import { LocalStorage } from 'node-localstorage'
import { LocalStorageCryptoStore } from 'matrix-js-sdk/lib/crypto/store/localStorage-crypto-store'
import dotenv from 'dotenv'
import chalk from 'chalk'

var Olm = require("olm/olm_legacy")
declare global {
	var Olm: any
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
		const request = require("request")
		sdk.request(request)
		///

		if (process.env.MATRIX_USER == undefined || process.env.MATRIX_USER == "") {
			console.log(chalk.red("Please add a MATRIX_USER in your .env"))
			process.exit(1)
		}
		if (process.env.MATRIX_TOKEN == undefined || process.env.MATRIX_TOKEN == "") {
			console.log(chalk.red("Please add a MATRIX_TOKEN in your .env"))
			process.exit(1)
		}
		if (process.env.MATRIX_URL == undefined || process.env.MATRIX_URL == "") {
			console.log(chalk.red("Please add a MATRIX_URL in your .env"))
			process.exit(1)
		}

		this.matrixClient = sdk.createClient({
			deviceId: "Streaks Server",
			baseUrl: process.env.MATRIX_URL,
			accessToken: process.env.MATRIX_TOKEN,
			userId: process.env.MATRIX_USER,

			sessionStore: new sdk.MemoryStore({ localStorage }),
			cryptoStore: new LocalStorageCryptoStore(localStorage),
		})
	}

	async connect() {
		if (this.connected)
			return
		await this.matrixClient.initCrypto()
		await this.matrixClient.startClient()

		// Send encrypted message, even if member isn't trusted
		this.matrixClient.setGlobalErrorOnUnknownDevices(false)
		this.connected = true
	}

	disconnect() {
		if (!this.connected)
			return
		this.matrixClient.stopClient()
	}

	async sendMessage(roomID: string, message: string) {
		await this.matrixClient.joinRoom(roomID)
		await this.matrixClient.uploadKeys()
		await this.matrixClient.sendTextMessage(roomID, message)
	}
}
