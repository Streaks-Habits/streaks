var htmlStateBox = document.getElementById("set_state_box")
var htmlSetSuccess = document.getElementById("set_success_state")
var htmlSetFreeze = document.getElementById("set_freeze_state")
var htmlSetFail = document.getElementById("set_fail_state")

isLoading = false

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

showStateBox = (htmlDay, htmlCal, e) => {
	if (isLoading)
		return
	hideStateBox()
	console.log("need to set day " + htmlDay.getAttribute("attr-date") + " of cal " + htmlCal.getAttribute("attr-filename"))
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
	htmlStateBox.style.top = e.clientY + "px"
	htmlStateBox.style.left = e.clientX + "px"
	htmlStateBox.style.display = "block"
}

hideStateBox = () => {
	if (htmlStateBox.style.display == "block" && !isLoading) {
		htmlStateBox.style.display = "none"
		htmlStateBox.classList.remove("spin")
		htmlSetSuccess.onclick = () => {}
		htmlSetFreeze.onclick = () => {}
		htmlSetFail.onclick = () => {}
	}
}
