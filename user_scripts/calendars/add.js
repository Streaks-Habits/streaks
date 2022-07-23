/* eslint-disable @typescript-eslint/no-var-requires */
const chalk = require('chalk')
const readlineSync = require('readline-sync')
const mongoose = require('mongoose')

const { connectDB } = require('../../dist/scripts/database/database')
const { User } = require('../../dist/scripts/database/User')

process.stdout.write(`${chalk.blue('streaks')} database => `)
connectDB().then(() => {
	console.log(chalk.green('connected'))

	console.log('\n\tAdd a new calendar.')

	var user_id = readlineSync.question('User id: ')
	var calendar_name = readlineSync.question('Calendar name: ')
	var user = new User(user_id)

	user.dbInit().then(() => {
		user.addCalendar(calendar_name).then(calendar => {
			console.log(`Calendar ${calendar.name} (${calendar.id}) ${chalk.green('added')}`)
		}).catch(err => {
			console.error(`Error: ${chalk.red(err.message)}`)
		}).finally(() => {
			mongoose.disconnect()
			process.exit(1)
		})
	}).catch((err) => {
		console.error(`Error: ${chalk.red(err)}`)
		mongoose.disconnect()
		process.exit(1)
	})
}).catch((err) => {
	console.error(chalk.red(err))
})
