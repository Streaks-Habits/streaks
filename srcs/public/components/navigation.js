import Theme from './theme.js';

export default {
	components: {
		Theme,
	},
	props: {
		showLogout: {
			type: Boolean,
			required: false,
			default: true,
		},
		showLogin: {
			type: Boolean,
			required: false,
			default: false,
		},
	},
	data() {
		return {
			theme: 'system',
			logo_light: '/public/icons/logoname_light.svg',
			logo_dark: '/public/icons/logoname_dark.svg',
			logo_current: '',
		};
	},
	created() {
		this.logo_currrent = this.logo_light;
		console.log(this.showLogout);
	},
	watch: {
		theme: function (newTheme) {
			if (newTheme == 'light') {
				this.logo_current = this.logo_light;
			} else {
				this.logo_current = this.logo_dark;
			}
		},
	},
	template: `
	<header>
		<div class="header_wrapper">
			<div></div>
			<div>
				<img id="logo" :src="logo_current" alt="streaks logo" />
			</div>
			<div>
				<Theme @update:theme="theme = $event" />
				<a href="/logout" class="logout" v-if="showLogout == true">
					<svg><use xlink:href="/public/icons/logout.svg#icon"></use></svg>
				</a>
				<a href="/login" class="login" v-if="showLogin == true">
					Login
				</a>
				<a href="/register" class="register button" v-if="showLogin == true">
					Register
				</a>
			</div>
		</div>
	</header>
	`,
};
