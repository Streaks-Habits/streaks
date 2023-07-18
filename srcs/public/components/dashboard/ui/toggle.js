export default {
	props: {
		toggle: {
			type: Boolean,
			required: true,
		},
	},
	data() {
		return {
			enabled: this.toggle,
		};
	},
	methods: {
		toggleToggle() {
			this.enabled = !this.enabled;
			this.$emit('update:toggle', this.enabled);
		},
	},
	template: `
		<div class="toggle">
			<input
				type="checkbox"
				class="checkbox"
				v-bind:checked="enabled"
				@click="toggleToggle"
			/>
			<div class="knobs"></div>
			<div class="layer"></div>
		</div>
	`,
};
