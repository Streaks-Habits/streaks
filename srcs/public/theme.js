// theme can be 'light', 'dark' or 'system'

function getSystemTheme() {
	return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function setTheme(themeToSet) {
	theme = themeToSet;
	var newTheme = themeToSet;
	console.log('Setting theme to ' + themeToSet);

	if (themeToSet == 'system') {
		newTheme = getSystemTheme() ? 'dark' : 'light';
		localStorage.setItem('theme', 'system');
	} else {
		console.log('Saving theme to local storage');
		localStorage.setItem('theme', themeToSet);
	}

	if (newTheme == 'dark') {
		document.documentElement.classList.remove('light');
		document.documentElement.classList.add('dark');
	} else {
		document.documentElement.classList.remove('dark');
		document.documentElement.classList.add('light');
	}
}

console.log(localStorage.getItem('theme') || 'system');
setTheme(localStorage.getItem('theme') || 'system');

// Handle system theme changes
function handleColorSchemeChange() {
	if (
		localStorage.getItem('theme') != 'system' &&
		localStorage.getItem('theme') != null
	) {
		return;
	}
	setTheme('system');
}

const colorSchemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
colorSchemeMediaQuery.addListener(handleColorSchemeChange);
