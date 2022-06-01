const chalk = require('chalk')
const mongoose = require("mongoose")

const { connectDB, getUserById, getCalendars } = require("../../dist/scripts/database")
const { countStreaks } = require("../../dist/scripts/utils")

process.stdout.write(`${chalk.blue("cestmaddy")} database => `);
connectDB().then(() => {
	console.log(chalk.green("connected"))

	console.log(`\n\tList calendars.`)

	getCalendars().then(calendars => {
		var promisesList = []

		calendars.forEach(calendar => {
			promisesList.push(new Promise((resolve, reject) => {
				getUserById(calendar.user_id).then((user) => {
					console.log(`${chalk.bold(calendar.name)} (${calendar._id}), owned by ${chalk.bold(user.username)} (${user._id}), streaks: ${chalk.cyan(countStreaks(calendar))}`)
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
