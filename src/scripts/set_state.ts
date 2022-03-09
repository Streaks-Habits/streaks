import path from "path"
import fs from 'fs'

import { StreaksFile } from "./interfaces"
import { isOver } from "./utils"

/**
 * Returns a promise that sets the specified state to the specified day on the specified calendar
 * @param filename - The name of the calendar file in the streaks folder (e.g. example.streaks.json)
 * @param dateString - The date formatted as YYYY-MM-DD
 * @param state - The state to define can be: success, fail, breakday, freeze
 * @returns - A promise that can resolve(void) or reject(errorMessage)
 */
export function setState(filename: string, dateString: string, state: string): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		let file: string = path.join("../../streaks", filename)
		let data: StreaksFile = require(file)
		let set: boolean = false

		if (!isOver(new Date(dateString)))
			reject("Date is not over")
		if (!["fail", "freeze", "breakday", "success"].includes(state))
			reject("State doesn't exist")

		for (let cur = 0; cur < data.days.length; cur++) {
			if (data.days[cur].date == dateString)
			{
				data.days[cur].state = state
				set = true
			}
		}
		if (!set)
		{
			data.days.push({
				date: dateString,
				state: state
			})
		}
		fs.writeFile(`./streaks/${filename}`, JSON.stringify(data, null, '\t'), (err) => {
			if (err)
				reject(err)
			else
				resolve()
		})
	})
}
