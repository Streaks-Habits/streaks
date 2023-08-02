export default {
	props: {
		id: {
			type: String,
			required: true,
		},
		options: {
			type: Array, // Array of strings
			required: true,
		},
		default: {
			type: String,
			required: false,
			default: null,
		},
		tabindex: {
			type: Number,
			required: false,
			default: 0,
		},
	},
	data() {
		return {
			selected: this.default
				? this.default
				: this.options.length > 0
				? this.options[0]
				: null,
			open: false,
		};
	},
	template: `
		<div
			class="select"
			:tabindex="tabindex"
			@blur="open = false"
		>
			<div
				class="selected"
				:class="{open: open}"
				@click="open = !open"
			>
				{{ selected }}
			</div>
			<div
				class="items"
				:class="{hide: !open}"
			>
				<div
					class="item"
					v-for="(option, i) of options"
					:key="i"
					@click="selected=option; open=false; $emit('update:select', option);"
				>
					{{ option }}
				</div>
			</div>
		</div>
	`,
};
