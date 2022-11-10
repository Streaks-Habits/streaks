export default {
	props: {
		day: {
			// { date: Luxon Date, isToday: boolean, gridColumn: number }
			type: Object,
			required: true,
		},
	},
	computed: {
		date() {
			return luxon.DateTime.fromISO(this.day.date).day;
		},
	},
	methods: {},
	template: `
		<li
			:class="{
				'calendar-day--today': day.isToday
			}"
			:style="{
				gridColumn: day.gridColumn
			}"
		>{{ date }}</li>
	`,
};
