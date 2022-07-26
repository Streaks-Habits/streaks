/* global document */

function addEditButtonListener(htmlCal, cal_id) {
	let edit_button = htmlCal.getElementsByClassName('edit')[0]
	edit_button.onclick = function() { console.log(cal_id) }
}
