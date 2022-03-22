const process = require('process');

const state = require("../dist/scripts/state")

if (process.argv.length != 5)
{
	console.log("Usage : node user_scripts/set_state.js <file.streaks.json> <YYYY-MM-DD> <state>")
	process.exit(-1)
}

try {
	new Date(process.argv[3]).toISOString()
}
catch (e) {
	console.error("Invalid date")
	process.exit(-1)
}

state.setState(process.argv[2], process.argv[3], process.argv[4]).then(() => {
	console.log(`${process.argv[3]} set to ${process.argv[4]} on ${process.argv[2]}`)
}).catch((err) => {
	console.error(err)
})
