export default {
	props: {
		loading: {
			type: Boolean,
			required: true,
		},
		text: {
			type: String,
			required: true,
		},
		type: {
			type: String,
			required: false,
			default: 'button',
		},
		additionalClasses: {
			type: String,
			required: false,
			default: '',
		},
	},
	data() {
		return {};
	},
	methods: {},
	template: `
		<div class="loading_button" :class="additionalClasses">
			<button :type="type" :disabled="loading">{{ text }}</button>
			<svg v-show="loading" class="spinner"><use xlink:href="/public/icons/spinner.svg#icon"></use></svg>
		</div>
	`,
};
