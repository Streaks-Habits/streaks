/* global document window */
/* global loadCalendar */
var htmlStateBox = document.getElementById('set_state_box')
var htmlSetSuccess = document.getElementById('set_success_state')
var htmlSetFreeze = document.getElementById('set_freeze_state')
var htmlSetFail = document.getElementById('set_fail_state')

var isLoading = false

/**
 * Makes a request to set the specified state to the specified day for the specified calendar
 *
 * @param {string} state - The state to define can be: success, fail, breakday, freeze
 * @param {string} dateString - The date formatted as YYYY-MM-DD
 * @param {string} id - The id of the calendar
 * @param {HTMLDivElement} htmlCal - The DOM element of the .dashboard_calendar to reload
 */
function setState (state, dateString, id, htmlCal) {
	isLoading = true
	htmlStateBox.classList.add('spin')

	let url = `/set_state/${id}`
	let data = {
		date: dateString,
		state: state
	}

	fetch(url, {
		method: 'POST',
		body: JSON.stringify(data),
		headers: {
			'Content-Type': 'application/json'
		}
	}).then(data => {
		if (data.ok)
		{
			loadCalendar(htmlCal).then(() => {
				isLoading = false
				hideStateBox()
			})
		}
	})
}

/**
 * Show the box that allows you to define a state of the day
 *
 * @param {HTMLElement} htmlDay - The DOM element of the day for which you want to define a state
 * @param {HTMLDivElement} htmlCal - The .dashboard_calendar DOM element of the day
 * @param {Event} e - The click event
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function showStateBox(htmlDay, htmlCal, e) {
	if (isLoading)
		return
	hideStateBox()
	window.onclick = function(e) {
		if (!htmlStateBox.contains(e.target)) {
			hideStateBox()
		}
	}
	htmlSetSuccess.onclick = function() {
		setState('success', htmlDay.getAttribute('attr-date'), htmlCal.getAttribute('attr-id'), htmlCal)
	}
	htmlSetFreeze.onclick = function() {
		setState('freeze', htmlDay.getAttribute('attr-date'), htmlCal.getAttribute('attr-id'), htmlCal)
	}
	htmlSetFail.onclick = function() {
		setState('fail', htmlDay.getAttribute('attr-date'), htmlCal.getAttribute('attr-id'), htmlCal)
	}
	htmlStateBox.style.top = e.clientY + window.scrollY + 'px'
	htmlStateBox.style.left = e.clientX + window.scrollX + 'px'
	htmlStateBox.style.display = 'block'
}

/**
 * Show the box that allows you to define a state of the day and clear every click events
 */
function hideStateBox() {
	if (htmlStateBox.style.display == 'block' && !isLoading) {
		htmlStateBox.style.display = 'none'
		htmlStateBox.classList.remove('spin')
		htmlSetSuccess.onclick = null
		htmlSetFreeze.onclick = null
		htmlSetFail.onclick = null
	}
}
