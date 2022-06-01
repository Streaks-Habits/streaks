const chalk = require('chalk')
const mongoose = require("mongoose")

const { connectDB, getCalendarById, User } = require("../../dist/scripts/database")

if (process.argv.length != 5)
{
	console.log("Usage : node user_scripts/calendars/set_state.js <calendar id> <YYYY-MM-DD> <state>")
	process.exit(1)
}

process.stdout.write(`${chalk.blue("cestmaddy")} database => `);
connectDB().then(() => {
	console.log(chalk.green("connected"))

	console.log(`\n\tSet a day state.`)

	getCalendarById(process.argv[2]).then((calendar) => {
		var user = new User(calendar.user_id)

		user.setDayState(calendar._id, process.argv[3], process.argv[4]).then(calendar => {
			console.log(`Calendar ${calendar.name} (${calendar._id}) ${chalk.green("updated")}`)
		}).catch(err => {
			console.error(`Error: ${chalk.red(err.message)}`)
		}).finally(() => {
			mongoose.disconnect()
		})
	}).catch((err) => {
		mongoose.disconnect()
		console.error(`Error: ${chalk.red(err.message)}`)
	})
}).catch((err) => {
	console.error(chalk.red(err))
})
