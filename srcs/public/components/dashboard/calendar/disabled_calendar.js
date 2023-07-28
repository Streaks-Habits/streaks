export default {
	props: {
		calendarData: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			calendar: this.calendarData,
		};
	},
	methods: {
		edit() {
			this.$emit('editor:edit', this.calendar);
		},
	},
	template: `
		<div class="disabled_calendar">
			<p class="name">{{ calendar.name }}</p>
			<div class="controls">
				<button @click="edit()"><svg class="edit"><use xlink:href="/public/icons/edit.svg#icon"></use></svg></button>
			</div>
		</div>
	`,
};
