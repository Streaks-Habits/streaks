import Theme from './theme.js';

export default {
	components: {
		Theme,
	},
	template: `
	<header>
		<div class="header_wrapper">
			<div></div>
			<div>
				<img id="logo" src="/public/icons/logoname.svg" alt="streaks.json logo">
			</div>
			<div>
				<Theme></Theme>
				<a href="/logout" class="logout">
					<svg><use xlink:href="/public/icons/logout.svg#icon"></use></svg>
				</a>
			</div>
		</div>
	</header>
	`,
};
