import Select from './ui/select.js';

export default {
	components: {
		Select,
	},
	props: {},
	data() {
		return {
			theme: 'system',
		};
	},
	created() {
		this.theme = localStorage.getItem('theme') || 'system';
		window
			.matchMedia('(prefers-color-scheme: dark)')
			.addEventListener('change', this.handleColorSchemeChange);
		this.changeTheme(this.theme);
	},
	methods: {
		getSystemTheme() {
			return window.matchMedia('(prefers-color-scheme: dark)').matches;
		},
		handleColorSchemeChange() {
			if (
				localStorage.getItem('theme') != 'system' &&
				localStorage.getItem('theme') != null
			) {
				return;
			}
			this.changeTheme('system');
		},
		changeTheme(theme) {
			var newTheme = theme;
			console.log('Setting theme to ' + theme);

			if (theme == 'system') {
				newTheme = this.getSystemTheme() ? 'dark' : 'light';
				localStorage.setItem('theme', 'system');
			} else {
				console.log('Saving theme to local storage');
				localStorage.setItem('theme', theme);
			}

			if (newTheme == 'dark') {
				document.documentElement.classList.remove('light');
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
				document.documentElement.classList.add('light');
			}
		},
	},
	template: `
	<div class="theme_select">
		<Select :options="['light', 'dark', 'system']" :default="theme" @update:select="changeTheme"></Select>
	</div>
	`,
};
