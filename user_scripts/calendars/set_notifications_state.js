/* eslint-disable @typescript-eslint/no-var-requires */
const chalk = require('chalk')
const readlineSync = require('readline-sync')
const mongoose = require('mongoose')

const { connectDB } = require('../../dist/scripts/database/database')
const { getCalendarById } = require('../../dist/scripts/database/Calendar')

/**
 * @typedef {import('../../dist/scripts/database/database').Calendar} Calendar
 */

/**
 * Ask the new state for reminders notification to the user (input)
 *
 * @param {Calendar} calendar - The calendar object of the calendar to update
 * @returns {boolean} true for enabling, false for disabling
 */
function askRemindersState(calendar) {
	console.log(chalk.blue('Reminders'))
	var current_reminders_state = 'disabled'
	if (calendar.notifications && calendar.notifications.reminders == true)
		current_reminders_state = 'enabled'
	var reminders_state = readlineSync.question(`    Enable [1] or disable [2] (currently ${chalk.bold(current_reminders_state)}): `).trim()

	if (reminders_state != '1' && reminders_state != '2') {
		console.log(chalk.red('Please choose between 1 (enable) or 2 (disable)'))
		return askRemindersState()
	}

	return reminders_state == '1'
}

/**
 * Ask the new state for congratulations notification to the user (input)
 *
 * @param {Calendar} calendar - The calendar object of the calendar to update
 * @returns {boolean} true for enabling, false for disabling
 */
function askCongratsState(calendar) {
	console.log(chalk.blue('Congratulations'))
	var current_congrats_state = 'disabled'
	if (calendar.notifications && calendar.notifications.congrats == true)
		current_congrats_state = 'enabled'
	var congrats_state = readlineSync.question(`    Enable [1] or disable [2] (currently ${chalk.bold(current_congrats_state)}): `).trim()

	if (congrats_state != '1' && congrats_state != '2') {
		console.log(chalk.red('Please choose between 1 (enable) or 2 (disable)'))
		return askCongratsState()
	}

	return congrats_state == '1'
}

process.stdout.write(`${chalk.blue('streaks')} database => `)
connectDB().then(() => {
	console.log(chalk.green('connected'))
	console.log('\n\tEnable / disable calendar notifications.')

	var calendar_id = readlineSync.question('Calendar id: ')

	getCalendarById(calendar_id).then((calendar) => {
		const reminders_state = askRemindersState(calendar)
		const congrats_state = askCongratsState(calendar)

		calendar.setRemindersState(reminders_state).then(() => {
			if (reminders_state)
				console.log(chalk.green('reminders enabled'))
			else
				console.log(chalk.green('reminders disabled'))
		}).catch(err => {
			console.error(`Error: ${chalk.red(err.message)}`)
		}).finally(() => {

			calendar.setCongratsState(congrats_state).then(() => {
				if (congrats_state)
					console.log(chalk.green('congrats enabled'))
				else
					console.log(chalk.green('congrats disabled'))
			}).catch(err => {
				console.error(`Error: ${chalk.red(err.message)}`)
			}).finally(() => {
				mongoose.disconnect()
			})
		})
	}).catch((err) => {
		mongoose.disconnect()
		console.error(`Error: ${chalk.red(err.message)}`)
	})
}).catch((err) => {
	console.error(chalk.red(err))
})
