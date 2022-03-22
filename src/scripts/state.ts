import path from "path"
import fs from 'fs'

import { StreaksFile } from "./interfaces"
import { isOver } from "./utils"
import { getStreaks } from "./data"

/**
 * Returns a promise that sets the specified state to the specified day on the specified calendar
 * @param filename - The name of the calendar file in the streaks folder (e.g. example.streaks.json)
 * @param dateString - The date formatted as YYYY-MM-DD
 * @param state - The state to define can be: success, fail, breakday, freeze
 * @returns - A promise that can resolve(void) or reject(errorMessage)
 */
export function setState(filename: string, dateString: string, state: string): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		let set: boolean = false

		if (!isOver(new Date(dateString)))
			return reject("Date is not over")
		if (!["fail", "freeze", "breakday", "success"].includes(state))
			return reject("State doesn't exist")

		getStreaks(filename).then((data) => {
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
		}).catch(() => {
			reject(`Can't access file : ${filename}`)
		})
	})
}
