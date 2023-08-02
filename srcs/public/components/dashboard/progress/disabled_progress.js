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
	methods: {
		edit() {
			this.$emit('editor:edit', this.progress);
		},
	},
	template: `
		<div class="disabled_progress">
			<p class="name">{{ progress.name }}</p>
			<div class="controls">
				<button @click="edit()"><svg class="edit"><use xlink:href="/public/icons/edit.svg#icon"></use></svg></button>
			</div>
		</div>
	`,
};
