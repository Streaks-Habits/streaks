var htmlDashboard = document.getElementById("dashboard")
var htmlCalendars = htmlDashboard.getElementsByClassName("dashboard_calendar")

loadCalendar = (htmlCal) => {
	return new Promise((resolve, reject) => {
		let filename = htmlCal.getAttribute('attr-filename')
		let date = htmlCal.getAttribute('attr-date')
		let url = `/calendar/${filename}?${new URLSearchParams({
			date: date
		})}`

		fetch(url).then(data => {
			if (data.ok)
			{
				data.text().then(text => {
					htmlCal.getElementsByClassName("calendar")[0].outerHTML = text

					htmlCal.getElementsByClassName("caret left")[0].onclick = function() { setPreviousMonth(htmlCal) }
					htmlCal.getElementsByClassName("caret right")[0].onclick = function() { setNextMonth(htmlCal) }
					htmlCal.getElementsByClassName("today")[0].onclick = function() { setToday(htmlCal) }

					let days = htmlCal.getElementsByClassName("day")
					for (let cur = 0; cur < days.length; cur++) {
						if (!days[cur].classList.contains("future")) {
							days[cur].onclick = function(e) {
								e.stopPropagation()
								showStateBox(days[cur], htmlCal, e)
							}
						}
					}
					resolve()
				})
			}
		})
	})
}

loadCalendars = () => {
	for (htmlCal of htmlCalendars) {
		loadCalendar(htmlCal)
	}
}

setPreviousMonth = (htmlCal) => {
	let date = htmlCal.getAttribute('attr-date')
	let year = parseInt(date.split('-')[0])
	let month = parseInt(date.split('-')[1])

	month--
	if (month <= 0)
	{
		month = 12
		year--
	}
	htmlCal.setAttribute('attr-date', `${year}-${month}`)
	loadCalendar(htmlCal)
}

setNextMonth = (htmlCal) => {
	let date = htmlCal.getAttribute('attr-date')
	let year = parseInt(date.split('-')[0])
	let month = parseInt(date.split('-')[1])

	month++
	if (month > 12)
	{
		month = 1
		year++
	}
	htmlCal.setAttribute('attr-date', `${year}-${month}`)
	loadCalendar(htmlCal)
}

setToday = (htmlCal) => {
	let date = new Date()

	htmlCal.setAttribute('attr-date', `${date.getFullYear()}-${date.getMonth() + 1}`)
	loadCalendar(htmlCal)
}

loadCalendars()
