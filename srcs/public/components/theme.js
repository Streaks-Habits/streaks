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

			if (theme == 'system') {
				newTheme = this.getSystemTheme() ? 'dark' : 'light';
				localStorage.setItem('theme', 'system');
			} else {
				localStorage.setItem('theme', theme);
			}

			if (newTheme == 'dark') {
				document.documentElement.classList.remove('light');
				document.documentElement.classList.add('dark');
				// Update theme color meta tag
				document
					.querySelector('meta[name="theme-color"]')
					.setAttribute('content', '#172327');
			} else {
				document.documentElement.classList.remove('dark');
				document.documentElement.classList.add('light');
				// Update theme color meta tag
				document
					.querySelector('meta[name="theme-color"]')
					.setAttribute('content', '#ffffff');
			}

			// Emit new theme
			this.$emit('update:theme', newTheme);
		},
	},
	template: `
	<div class="theme_select">
		<Select :options="['light', 'dark', 'system']" :default="theme" @update:select="changeTheme"></Select>
	</div>
	`,
};
