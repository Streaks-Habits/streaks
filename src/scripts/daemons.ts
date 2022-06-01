import fs from 'fs'
import readline from 'readline'
import path from 'path'
import { exec } from 'child_process'
import os from 'os'

import { getCalendars, User } from './database'
import { dateString } from './utils'
import chalk from 'chalk'

/**
 * Go through the calendar and set the breakday status to the current day
 * if it is a breakday (a 0 in agenda)
 * @return - A promise that resolve(void) at the end
 */
function setBreakdays(): Promise<void> {
	return new Promise((resolve, _reject) => {
		getCalendars().then((db_calendars) => {
			var promisesList: Array<Promise<void>> = Array()

			db_calendars.forEach((db_calendar) => {
				promisesList.push(new Promise((resolve, _reject) => {
					var user = new User(db_calendar.user_id.toString())
					var weekday: number = new Date().getDay()

					if (!db_calendar.agenda[weekday]) {
						if (db_calendar.days.get(dateString(new Date())) != "success") {
							user.setDayState(db_calendar._id, dateString(new Date()), "breakday").catch((err) => {
								console.error(`Daemons: ${chalk.red(err.message)}`)
							}).finally(() => {
								resolve()
							})
						}
						else
							resolve()
					}
					else
						resolve()
				}))
			})
			Promise.allSettled(promisesList).then(() => {
				resolve()
			})
		}).catch((err) => {
			console.error(`Daemons: ${chalk.red(err.message)}`)
			resolve()
		})
	})
}

/**
 * Run each command in daemons/commands.list (one command per line) and put the logs in daemons/daemons.log.
 * Then run the setBreakday function
 * @returns - A promise that resolve(void) at the end
 */
export function runDaemons(): Promise<void> {
	return new Promise((resolve, _reject) => {
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
							commandReturn = `${startDate.toISOString()} => ${line} : ${commandReturn.trim()}${os.EOL}`
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
			setBreakdays().then(() => {
				resolve()
			})
		})
	})
}
