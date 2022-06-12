const chalk = require('chalk')
const readlineSync = require('readline-sync')
const mongoose = require("mongoose")

const { connectDB, addUser } = require("../../dist/scripts/database/database")

process.stdout.write(`${chalk.blue("streaks")} database => `);
connectDB().then(() => {
	console.log(chalk.green("connected"))

	console.log(`\n\tAdd a new user.`)

	var username = readlineSync.question('Username: ')
	var password = readlineSync.question('Password: ', { hideEchoBack: true })

	addUser(username, password).then(user => {
		console.log(`User ${username} (${user.id}) ${chalk.green("added")}`)
	}).catch(err => {
		console.error(`Error: ${chalk.red(err)}`)
	}).finally(() => {
		mongoose.disconnect()
	})
}).catch((err) => {
	console.error(chalk.red(err))
})
