export default {
	props: {
		id: {
			type: String,
			required: true,
		},
		toggle: {
			type: Boolean,
			required: true,
		},
	},
	data() {
		console.log(this.id);
		return {
			enabled: this.toggle,
			id: this.id,
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
				:id="id"
				v-bind:checked="enabled"
				@click="toggleToggle"
			/>
			<div class="knobs"></div>
			<div class="layer"></div>
		</div>
	`,
};
