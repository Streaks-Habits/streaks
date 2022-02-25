const bcrypt = require('bcrypt')

if (process.argv.length <= 2 || process.argv.length > 4) {
	console.log("Usage: node user_scripts/hash_pass.js PASSWORD")
	process.exit(-1)
}

bcrypt.hash(process.argv[2], 10, function(err, hash) {
	if (err) throw err
	console.log(hash)
})
