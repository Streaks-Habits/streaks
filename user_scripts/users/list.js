const chalk = require('chalk')
const mongoose = require("mongoose")

const { connectDB, getUsers } = require("../../dist/scripts/database")

process.stdout.write(`${chalk.blue("streaks")} database => `);
connectDB().then(() => {
	console.log(chalk.green("connected"))

	console.log(`\n\tList users.`)

	getUsers().then(users => {
		users.forEach(user => {
			console.log(`${chalk.bold(user.username)} (${user._id})`)
		})
	}).catch(err => {
		console.error(`Error: ${chalk.red(err)}`)
	}).finally(() => {
		mongoose.disconnect()
	})
}).catch((err) => {
	console.error(chalk.red(err))
})
