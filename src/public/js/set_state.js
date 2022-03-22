var htmlStateBox = document.getElementById("set_state_box")
var htmlSetSuccess = document.getElementById("set_success_state")
var htmlSetFreeze = document.getElementById("set_freeze_state")
var htmlSetFail = document.getElementById("set_fail_state")

isLoading = false

/**
 * Makes a request to set the specified state to the specified day for the specified calendar
 * @param state - The state to define can be: success, fail, breakday, freeze
 * @param dateString - The date formatted as YYYY-MM-DD
 * @param filename - The name of the calendar file in the streaks folder (e.g. example.streaks.json)
 * @param htmlCal - The DOM element of the .dashboard_calendar to reload
 */
setState = (state, dateString, filename, htmlCal) => {
	isLoading = true
	htmlStateBox.classList.add("spin")
	console.log(`set ${dateString} to ${state} on ${filename}`)

	let url = `/set_state/${filename}/${dateString}/${state}`

	fetch(url).then(data => {
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
 * @param htmlDay - The DOM element of the day for which you want to define a state
 * @param htmlCal - The .dashboard_calendar DOM element of the day
 * @param e - The click event
 */
showStateBox = (htmlDay, htmlCal, e) => {
	if (isLoading)
		return
	hideStateBox()
	window.onclick = function(e) {
		if (!htmlStateBox.contains(e.target)) {
			hideStateBox()
		}
	}
	htmlSetSuccess.onclick = function() {
		setState("success", htmlDay.getAttribute("attr-date"), htmlCal.getAttribute("attr-filename"), htmlCal)
	}
	htmlSetFreeze.onclick = function() {
		setState("freeze", htmlDay.getAttribute("attr-date"), htmlCal.getAttribute("attr-filename"), htmlCal)
	}
	htmlSetFail.onclick = function() {
		setState("fail", htmlDay.getAttribute("attr-date"), htmlCal.getAttribute("attr-filename"), htmlCal)
	}
	htmlStateBox.style.top = e.clientY + window.scrollY + "px"
	htmlStateBox.style.left = e.clientX + window.scrollX + "px"
	htmlStateBox.style.display = "block"
}

/**
 * Show the box that allows you to define a state of the day and clear every click events
 */
hideStateBox = () => {
	if (htmlStateBox.style.display == "block" && !isLoading) {
		htmlStateBox.style.display = "none"
		htmlStateBox.classList.remove("spin")
		htmlSetSuccess.onclick = () => {}
		htmlSetFreeze.onclick = () => {}
		htmlSetFail.onclick = () => {}
	}
}
