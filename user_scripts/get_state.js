const process = require('process');

const data = require("../dist/scripts/data")

if (process.argv.length != 4)
{
	console.log("Usage : node user_scripts/get_state.js <file.streaks.json> <YYYY-MM-DD>")
	process.exit(-1)
}

try {
	new Date(process.argv[3]).toISOString()
}
catch (e) {
	console.error("Invalid date")
	process.exit(-1)
}

data.getStreaks(process.argv[2]).then((streaks) => {
	console.log(data.findDayInData(streaks, process.argv[3]).state)

}).catch(() => {
	console.error(`Can't access file : ${process.argv[2]}`)
})
