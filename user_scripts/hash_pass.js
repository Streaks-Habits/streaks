const bcrypt = require('bcrypt')
const path = require('path')

if (process.argv.length <= 2) {
	console.log("Usage: node user_scripts/hash_pass.js PASSWORD")
	process.exit(-1)
}

var password = process.argv[2]

bcrypt.hash(password, 10, function(err, hash) {
	if (err) throw err
	console.log(hash)
})
