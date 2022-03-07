import path from 'path'
import fs from 'fs'

import { Data, DataDay } from "./interfaces";

export function getData(filename: string): Promise<Data> {
	return new Promise<Data>((resolve, reject) => {
		var dataPath: string = path.join(__dirname, "../../", "streaks", filename)
		var data: Data

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

export function findDayInData(data: Data, date: string): DataDay {
	var dataDay: DataDay = {
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
