export default {
	props: {
		progressData: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			progress: this.progressData,
		};
	},
	template: `
		<div class="disabled_progress">
			<p class="name">{{ progress.name }}</p>
		</div>
	`,
};
