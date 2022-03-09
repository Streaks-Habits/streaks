const fs = require("fs")
const path = require("path")
const { parse, stringify } = require('envfile')
const readlineSync = require('readline-sync')
const bcrypt = require('bcrypt')

const defaultPort = 80
const defaultTZ = "Europe/Paris"

var envPath = path.join(__dirname, "../", ".env")

/**
 * Write the specified content to the env file
 * @param content - The string to write
 * @returns - A promise that resolve() or reject(err)
 */
writeEnv = (content) => {
	return new Promise((resolve, reject) => {
		fs.writeFile(envPath, content, 'utf-8', (err) => {
			if (err) return reject(err)
			resolve()
		})
	})
}

/**
 * Get the content of the env file, create it if it doesn't exists
 * @returns - A promise that resolve(content) or reject(err)
 */
getEnv = () => {
	return new Promise((resolve, reject) => {
		fs.access(envPath, fs.R_OK && fs.W_OK, (err) => {
			if (err) {
				writeEnv("").then(() => {
					resolve("")
				}).catch((err) => {
					reject(err)
				})
			}
			else {
				fs.readFile(envPath, 'utf-8', (err, data) => {
					if (err) return reject(err)
					resolve(data)
				})
			}
		})
	})
}

/**
 * Ask a password on the standard input and return it hashed
 * @returns - A promise that resolve(hash)
 */
getPassword = () => {
	return new Promise((resolve, reject) => {
		var password = readlineSync.question('Type password : ', { hideEchoBack: true })

		bcrypt.hash(password, 10, (err, hash) => {
			if (err) throw err
			resolve(hash)
		})
	})
}

getEnv().then((envContent) => {
	var envObj = parse(envContent)
	var changePass = false

	if (!envObj.hasOwnProperty("PORT"))
		envObj["PORT"] = defaultPort
	if (!envObj.hasOwnProperty("TZ"))
		envObj["TZ"] = defaultTZ
	if (!envObj.hasOwnProperty("JWT_KEY"))
		envObj["JWT_KEY"] = Math.random().toString(16).substring(2, 14)
	if (!envObj.hasOwnProperty("PASSWORD_HASH"))
		changePass = true
	else {
		if (readlineSync.question('Do you want to change the password? [Y/n] ').toUpperCase() == 'Y')
			changePass = true
	}

	if (changePass) {
		getPassword().then((hash) => {
			envObj["PASSWORD_HASH"] = hash
			writeEnv(stringify(envObj))
			console.log(".env successfully updated !")
		})
	}
	else {
		writeEnv(stringify(envObj))
		console.log(".env successfully updated !")
	}
}).catch((err) => {
	console.error(`Can't access ${envPath} : ${err}`)
})
