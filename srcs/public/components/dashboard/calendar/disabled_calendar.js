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
	template: `
		<div class="disabled_calendar">
			<p class="name">{{ calendar.name }}</p>
		</div>
	`,
};
