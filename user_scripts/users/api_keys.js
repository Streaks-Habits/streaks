/* eslint-disable @typescript-eslint/no-var-requires */
const chalk = require('chalk')
const readlineSync = require('readline-sync')
const mongoose = require('mongoose')

const { connectDB } = require('../../dist/scripts/database/database')
const { getUserById } = require('../../dist/scripts/database/User')

process.stdout.write(`${chalk.blue('streaks')} database => `)
connectDB().then(() => {
	console.log(chalk.green('connected'))

	console.log('\n\tCreate API key.')

	var user_id = readlineSync.question('User id: ')

	getUserById(user_id).then(user => {
		var key_name = readlineSync.question('Key name: ')

		user.createApiKey(key_name).then((api_key) => {
			console.log(`\nHere is your api key: ${chalk.bold(api_key)}\n`)

			console.log('Be sure to save it, we won\'t do it for you ;)')
		}).catch(err => {
			console.error(`Error: ${chalk.red(err.message)}`)
		}).finally(() => {
			mongoose.disconnect()
		})
	}).catch(err => {
		console.error(`Error: ${chalk.red(err)}`)
		mongoose.disconnect()
	})
}).catch((err) => {
	console.error(chalk.red(err))
})
