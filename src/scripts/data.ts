import path from 'path'
import fs from 'fs'

import { StreaksFile, StreaksFileDay } from "./interfaces";
import { dateString } from './utils';

/**
 * Returns a StreaksFile, which contains the contents of the specified streaks file
 * @param filename - The name of the calendar file in the streaks folder (e.g. example.streaks.json)
 * @returns - A promise that resolve(StreaksFile) or reject(void)
 */
export function getStreaks(filename: string): Promise<StreaksFile> {
	return new Promise<StreaksFile>((resolve, reject) => {
		var dataPath: string = path.join(__dirname, "../../", "streaks", filename)
		var data: StreaksFile

		fs.readFile(dataPath, 'utf-8', (err, dataString) => {
			if (err) return reject()

			try {
				data = JSON.parse(dataString)
			}
			catch (e)
			{
				return reject()
			}
			data.filename = path.basename(dataPath)
			resolve(data)
		})
	})
}

/**
 * Returns a StreaksFileDay; the data of the specified day for the specified calendar
 * @param data - A StreaksFile to search in
 * @param date - The date formatted as YYYY-MM-DD
 * @returns - StreaksFileDay requested. If it does not exist, return a StreaksFileDay with a state of fail
 */
export function findDayInData(data: StreaksFile, date: string): StreaksFileDay {
	var dataDay: StreaksFileDay = {
		date: date,
		state: "fail"
	}

	for (let cur = 0; cur < data.days.length; cur++) {
		if (data.days[cur].date == date)
		{
			if (!["fail", "freeze", "breakday", "success"].includes(data.days[cur].state))
				break
			dataDay = data.days[cur]
		}
	}
	return (dataDay)
}

/**
 * Returns the current streaks of the specified calendar
 * @param data - The StreaksFile to count in
 * @returns - The current streaks (a number)
 */
export function countStreaks(data: StreaksFile): number {
	var date: Date = new Date()
	var streaks: number = 0
	var current_state: string

	current_state = findDayInData(data, dateString(date)).state
	do {
		if (current_state == "success")
			streaks++;
		date.setDate(date.getDate() - 1)
		current_state = findDayInData(data, dateString(date)).state
	} while (current_state != "fail")
	return (streaks)
}
