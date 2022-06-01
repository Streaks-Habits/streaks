const chalk = require("chalk")
const mongoose = require("mongoose")

const daemons = require("../dist/scripts/daemons")
const { connectDB } = require("../dist/scripts/database")

process.stdout.write(`${chalk.blue("cestmaddy")} database => `);
connectDB().then(() => {
	console.log(chalk.green("connected"))

	console.log("\tLaunching daemons...")
	daemons.runDaemons().then(() => {
		console.log("Done!")
	}).finally(() => {
		mongoose.disconnect()
	})
}).catch((err) => {
	console.error(chalk.red(err))
})
