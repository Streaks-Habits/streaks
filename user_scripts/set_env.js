/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs')
const chalk = require('chalk')
const path = require('path')
const { parse, stringify } = require('envfile')
const readlineSync = require('readline-sync')

const defaultPort = 80
const defaultTZ = 'Europe/Paris'

var envPath = path.join(__dirname, '../', '.env')

/**
 * Write the specified content to the env file
 *
 * @param {string} content - The string to write
 * @returns {Promise} - A promise that resolve() or reject(err)
 */
function writeEnv (content) {
	return new Promise((resolve, reject) => {
		fs.writeFile(envPath, content, 'utf-8', (err) => {
			if (err) return reject(err)
			resolve()
		})
	})
}

/**
 * Get the content of the env file, create it if it doesn't exists
 * 
 * @returns {Promise} - A promise that resolve(content) or reject(err)
 */
function getEnv() {
	return new Promise((resolve, reject) => {
		fs.access(envPath, fs.R_OK && fs.W_OK, (err) => {
			if (err) {
				writeEnv('').then(() => {
					resolve('')
				}).catch((err) => {
					reject(err)
				})
			}
			else {
				fs.readFile(envPath, 'utf-8', (err, data) => {
					if (err) return reject(err)
					resolve(data)
				})
			}
		})
	})
}

getEnv().then((envContent) => {
	var envObj = parse(envContent)

	if (!Object.keys(envObj).includes('PORT'))
		envObj['PORT'] = defaultPort
	if (!Object.keys(envObj).includes('TZ'))
		envObj['TZ'] = defaultTZ
	if (!Object.keys(envObj).includes('JWT_KEY'))
		envObj['JWT_KEY'] = Math.random().toString(16).substring(2, 14)
	if (!Object.keys(envObj).includes('MONGO_URI')) {
		let mongo_uri = readlineSync.question('Paste your MongoDB connection string\n\t(leave empty if using the default docker-compose): ')
		if (mongo_uri != '')
			envObj['MONGO_URI'] = mongo_uri
	}

	writeEnv(stringify(envObj)).then(() => {
		console.log(chalk.green('.env successfully updated !'))
	}).catch((err) => {
		console.error(`Error: ${chalk.red(err)}`)
	})
}).catch((err) => {
	console.error(`Error: ${chalk.red(err)}`)
})
