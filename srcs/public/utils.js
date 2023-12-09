// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getScrollbarWidth() {
	// Creating an outer div
	const outer = document.createElement('div');
	outer.style.visibility = 'hidden';
	outer.style.overflow = 'scroll'; // forcing scrollbar to appear
	outer.style.msOverflowStyle = 'scrollbar'; // for IE 10+
	document.body.appendChild(outer);

	// Creating an inner div
	const inner = document.createElement('div');
	outer.appendChild(inner);

	// Calculating scrollbar width
	const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

	// Removing the divs
	outer.parentNode.removeChild(outer);

	return scrollbarWidth;
}

console.log('utils.js loaded');
