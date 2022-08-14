/* global document */
/* global showStateBox */
var htmlDashboard = document.getElementById('dashboard')
var htmlCalendars = htmlDashboard.getElementsByClassName('dashboard_calendar')

/**
 * Load the calendar of the specified .dashboard_calendar element (do a GET request)
 *
 * @param {HTMLDivElement} htmlCal - The DOM element of the .dashboard_calendar to load
 * @returns {Promise} - A promise that resolve(void) when finished
 */
function loadCalendar(htmlCal) {
	return new Promise((resolve) => {
		let cal_id = htmlCal.getAttribute('attr-id')
		let date = htmlCal.getAttribute('attr-date')
		let url = `/calendar_view/${cal_id}?${new URLSearchParams({
			date: date
		})}`

		fetch(url).then(data => {
			if (data.ok)
			{
				data.text().then(text => {
					htmlCal.getElementsByClassName('calendar')[0].outerHTML = text

					htmlCal.getElementsByClassName('caret left')[0].onclick = function() { setPreviousMonth(htmlCal) }
					htmlCal.getElementsByClassName('caret right')[0].onclick = function() { setNextMonth(htmlCal) }
					htmlCal.getElementsByClassName('today')[0].onclick = function() { setToday(htmlCal) }

					let days = htmlCal.getElementsByClassName('day')
					for (let cur = 0; cur < days.length; cur++) {
						if (!days[cur].classList.contains('future')) {
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

/**
 * Call the loadCalendar function for each .dashboard_calendar element
 */
function loadCalendars() {
	for (let htmlCal of htmlCalendars) {
		loadCalendar(htmlCal)
	}
}

/**
 * Set the specified .dashboard_calendar element to the previous month then load it
 *
 * @param {HTMLDivElement} htmlCal - The DOM element of the .dashboard_calendar
 */
function setPreviousMonth(htmlCal) {
	let date = htmlCal.getAttribute('attr-date')
	let year = parseInt(date.split('-')[0])
	let month = parseInt(date.split('-')[1])

	month--
	if (month <= 0)
	{
		month = 12
		year--
	}
	month = `${month}`
	if (month.length == 1)
		month = `0${month}`
	htmlCal.setAttribute('attr-date', `${year}-${month}`)
	loadCalendar(htmlCal)
}

/**
 * Set the specified .dashboard_calendar element to the next month then load it
 *
 * @param {HTMLDivElement} htmlCal - The DOM element of the .dashboard_calendar
 */
function setNextMonth(htmlCal) {
	let date = htmlCal.getAttribute('attr-date')
	let year = parseInt(date.split('-')[0])
	let month = parseInt(date.split('-')[1])

	month++
	if (month > 12)
	{
		month = 1
		year++
	}
	month = `${month}`
	if (month.length == 1)
		month = `0${month}`
	htmlCal.setAttribute('attr-date', `${year}-${month}`)
	loadCalendar(htmlCal)
}

/**
 * Set the specified .dashboard_calendar element to the current month then load it
 *
 * @param {HTMLDivElement} htmlCal - The DOM element of the .dashboard_calendar
 */
function setToday(htmlCal) {
	let date = new Date()

	let month = `${date.getMonth() + 1}`
	if (month.length == 1)
		month = `0${month}`
	htmlCal.setAttribute('attr-date', `${date.getFullYear()}-${month}`)
	loadCalendar(htmlCal)
}

loadCalendars()
