import fs from 'fs'
import readline from 'readline'
import path from 'path'
import { exec } from 'child_process'

import { dateString, getCalendarList } from './calendar'
import { findDayInData, getData } from './data'
import { setState } from './set_state'

function setBreakday(): void {
	getCalendarList().then((calendarsMeta) => {
		calendarsMeta.forEach((calendar) => {
			getData(calendar.filename).then((data) => {
				var weekday: number = new Date().getDay()

				if (data.firstDayOfWeek == 1) {
					weekday--
					if (weekday == -1)
						weekday = 6
				}
				if (!data.agenda[weekday]) {
					if (findDayInData(data, dateString(new Date())).state == "fail") {
						setState(calendar.filename, dateString(new Date()), "breakday")
					}
				}
			}).catch(() => {
				console.error("error in getData (daemons.ts, setBreakday())")
			})
		})
	}).catch((err) => {
		console.error(err)
	})
}

export function runDaemons(): void {
	var commandsListPath: string = path.join(__dirname, "../../", "daemons", "commands.list")
	var logPath: string = path.join(__dirname, "../../", "daemons", "daemons.log")

	new Promise<void>((resolve, reject) => {
		fs.access(commandsListPath, (err) => {
			if (err) {
				console.error(err)
				reject()
			}
			var rl = readline.createInterface({ input: fs.createReadStream(commandsListPath) })
			var execPromises: Array<Promise<void>> = Array()

			rl.on('line', (line) => {
				execPromises.push(new Promise((resolve, reject) => {
					exec(line, (error, stdout, stderr) => {
						var startDate: Date = new Date()
						var commandReturn: string

						if (error)
							commandReturn = `error: ${error.message}`
						else if (stderr)
							commandReturn = `command error: ${stderr}`
						else
							commandReturn = `${stdout}`
						commandReturn = `\n${startDate.toISOString()} => ${line} : ${commandReturn.trim()}`
						fs.appendFile(logPath, commandReturn, 'utf-8', (err) => {
							if (err) {
								console.error(err)
								reject()
							}
							resolve()
						})
					})
				}))
			})
			rl.on('close', () => {
				Promise.allSettled(execPromises).then(() => {
					resolve()
				})
			})
		})
	}).finally(() => {
		setBreakday()
	})
}
