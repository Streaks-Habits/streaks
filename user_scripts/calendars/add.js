const chalk = require('chalk')
const readlineSync = require('readline-sync')
const mongoose = require("mongoose")

const { connectDB, addCalendar } = require("../../dist/scripts/database")

process.stdout.write(`${chalk.blue("cestmaddy")} database => `);
connectDB().then(() => {
	console.log(chalk.green("connected"))

	console.log(`\n\tAdd a new calendar.`)

	var user_id = readlineSync.question('User id: ')
	var calendar_name = readlineSync.question('Calendar name: ')

	addCalendar(calendar_name, user_id).then(calendar => {
		console.log(`Calendar ${calendar.name} (${calendar._id}) ${chalk.green("added")}`)
	}).catch(err => {
		console.error(`Error: ${chalk.red(err)}`)
	}).finally(() => {
		mongoose.disconnect()
	})
}).catch((err) => {
	console.error(chalk.red(err))
})
