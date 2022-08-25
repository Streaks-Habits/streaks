/* global document */
var content_div = document.getElementById('content')

function load_calendar_component(calendar_id) {
	content_div.innerHTML = ''
	fetch('/components/settings/calendars/' + calendar_id).then(data => {
		if (data.ok)
		{
			data.text().then(text => {
				content_div.innerHTML = text
			})
		}
	})
}
