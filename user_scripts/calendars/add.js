const chalk = require('chalk')
const readlineSync = require('readline-sync')
const mongoose = require("mongoose")

const { connectDB, addCalendar, User } = require("../../dist/scripts/database")

process.stdout.write(`${chalk.blue("streaks")} database => `);
connectDB().then(() => {
	console.log(chalk.green("connected"))

	console.log(`\n\tAdd a new calendar.`)

	var user_id = readlineSync.question('User id: ')
	var calendar_name = readlineSync.question('Calendar name: ')
	var user = new User(user_id)

	user.addCalendar(calendar_name).then(calendar => {
		console.log(`Calendar ${calendar.name} (${calendar.id}) ${chalk.green("added")}`)
	}).catch(err => {
		console.error(`Error: ${chalk.red(err)}`)
	}).finally(() => {
		mongoose.disconnect()
	})
}).catch((err) => {
	console.error(chalk.red(err))
})
