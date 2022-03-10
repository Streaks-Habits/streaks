const daemons = require("../dist/scripts/daemons")

console.log("Launching daemons...")
daemons.runDaemons().then(() => {
	console.log("Done!")
})
