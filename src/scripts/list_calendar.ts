import fs from 'fs'
import path from 'path'

import { CalendarMeta, Data } from './interfaces'

export function getCalendarList(): Promise<Array<CalendarMeta>> {
	return new Promise<Array<CalendarMeta>>((res, _rej) => {
		var calendarList: Array<CalendarMeta> = new Array()

		fs.readdir("./streaks", (err, files) => {
			if (err) throw err
			for (let file of files) {
				if (file.endsWith(".streaks.json") && fs.lstatSync(`./streaks/${file}`).isFile())
				{
					let data: Data = require(path.join("../../streaks", file))
					calendarList.push({
						name: data.name,
						filename: file
					})
				}
			}
			res(calendarList)
		})
	})
}
