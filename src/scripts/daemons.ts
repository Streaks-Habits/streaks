import fs from 'fs'
import readline from 'readline'
import path from 'path'
import { exec } from 'child_process'

export function runDaemons(): void {
	var commandsListPath: string = path.join(__dirname, "../../", "daemons", "commands.list")
	var logPath: string = path.join(__dirname, "../../", "daemons", "daemons.log")
	var rl = readline.createInterface({ input: fs.createReadStream(commandsListPath) })

	rl.on('line', (line) => {
		var startDate: Date = new Date()
		var commandReturn: string

		exec(line, (error, stdout, stderr) => {
			if (error)
				commandReturn = `error: ${error.message}`
			else if (stderr)
				commandReturn = `command error: ${stderr}`
			else
				commandReturn = `${stdout}`
			commandReturn = `\n${startDate.toISOString()} => ${line}\n  > ${commandReturn}`
			fs.appendFile(logPath, commandReturn, 'utf-8',(err) => {
				if (err) throw err
			})
		})
	})
}
