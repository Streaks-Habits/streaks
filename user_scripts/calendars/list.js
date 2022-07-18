/* eslint-disable @typescript-eslint/no-var-requires */
const chalk = require('chalk')
const mongoose = require('mongoose')

const { connectDB } = require('../../dist/scripts/database/database')
const { getUserById } = require('../../dist/scripts/database/User')
const { getCalendars } = require('../../dist/scripts/database/Calendar')

process.stdout.write(`${chalk.blue('streaks')} database => `)
connectDB().then(() => {
	console.log(chalk.green('connected'))

	console.log('\n\tList calendars.')

	getCalendars().then(calendars => {
		var promisesList = []

		calendars.forEach(calendar => {
			promisesList.push(new Promise((resolve, reject) => {
				getUserById(calendar.user_id).then((user) => {
					console.log(`${chalk.bold(calendar.name)} (${calendar.id}), owned by ${chalk.bold(user.username)} (${user.id}), streaks: ${chalk.cyan(calendar.countStreaks())}`)
					resolve()
				}).catch(err => {
					console.error(`Error: ${chalk.red(err.message)}`)
					reject()
				})
			}))
		})

		Promise.allSettled(promisesList).then(() => {
			mongoose.disconnect()
		})
	}).catch(err => {
		mongoose.disconnect()
		console.error(`Error: ${chalk.red(err)}`)
	})
}).catch((err) => {
	console.error(chalk.red(err))
})
