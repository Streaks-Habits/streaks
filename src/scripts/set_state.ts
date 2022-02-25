import path, { resolve } from "path"
import fs from 'fs'

import { Data } from "./interfaces"
import { isOver } from "./calendar"

export function setState(filename: string, dateString: string, state: string): Promise<void> {
	return new Promise<void>((res, _rej) => {
		let file: string = path.join("../../streaks", filename)
		let data: Data = require(file)
		let set: boolean = false

		if (!isOver(new Date(dateString)))
			res()
		if (!["fail", "freeze", "breakday", "success"].includes(state))
			res()

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
			if (err) throw err
			res()
		})
	})
}
