import CalendarDayItem from '/public/components/dashboard/calendar/day_item.js';

export default {
	components: {
		CalendarDayItem,
	},
	props: {
		month: {
			// format: 'YYYY-MM'
			type: String,
			required: false,
			default: luxon.DateTime.now().toFormat('yyyy-MM'),
		},
	},
	data() {
		return {
			monthDate: luxon.DateTime.fromISO(this.month),
		};
	},
	computed: {
		days() {
			const days = [];
			const today = luxon.DateTime.now().startOf('day');

			let firstDay = this.monthDate
				.startOf('month')
				//.startOf('week')
				.startOf('day');
			const lastDay = this.monthDate
				.endOf('month')
				//.endOf('week')
				.startOf('day');

			while (firstDay <= lastDay) {
				days.push({
					date: firstDay,
					isToday: firstDay == today,
					gridColumn: days.length === 0 ? firstDay.weekday : null, // 1 = Monday, 7 = Sunday, null = not first day of month
				});
				firstDay = firstDay.plus({ days: 1 });
			}
			return days;
		},
	},
	methods: {
		prevMonth() {
			this.monthDate = this.monthDate.minus({ months: 1 });
		},
		nextMonth() {
			this.monthDate = this.monthDate.plus({ months: 1 });
		},
	},
	template: `
		<button @click="prevMonth()">Prev</button>
		<button @click="nextMonth()">Next</button>
		<ol class="calendar_grid">
			<CalendarDayItem
				v-for="day in days"
				:key="day.date"
				:day="day"
			/>
		</ol>
	`,
};
