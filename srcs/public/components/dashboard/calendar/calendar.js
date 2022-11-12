import CalendarDayItem from '/public/components/dashboard/calendar/day_item.js';

export default {
	components: {
		CalendarDayItem,
	},
	props: {
		calendarData: {
			type: Object,
			required: true,
		},
		month: {
			// format: 'YYYY-MM'
			type: String,
			required: false,
			default: luxon.DateTime.now().toFormat('yyyy-MM'),
		},
	},
	data() {
		return {
			calendar: this.calendarData,
			days: [],
			monthDate: luxon.DateTime.fromISO(this.month),
			monthString: '', // defined in created(),
		};
	},
	created() {
		this.updateMonth();
	},
	computed: {
		daysLetters() {
			const daysLetters = [];

			let firstDay = this.monthDate.startOf('week').startOf('day');
			const lastDay = this.monthDate.endOf('week').startOf('day');

			while (firstDay <= lastDay) {
				daysLetters.push(firstDay.toFormat('ccc'));
				firstDay = firstDay.plus({ days: 1 });
			}
			return daysLetters;
		},
	},
	methods: {
		updateMonth() {
			this.monthString = `${this.monthDate.monthLong} ${this.monthDate.year}`;
			this.createDays();
			this.retrieveStatus();
		},
		prevMonth() {
			this.monthDate = this.monthDate.minus({ months: 1 });
			this.updateMonth();
		},
		nextMonth() {
			this.monthDate = this.monthDate.plus({ months: 1 });
			this.updateMonth();
		},
		currentMonth() {
			this.monthDate = luxon.DateTime.now();
			this.updateMonth();
		},
		createDays() {
			const days = [];
			const today = luxon.DateTime.now().startOf('day');

			let firstDay = this.monthDate.startOf('month').startOf('day');
			const lastDay = this.monthDate.endOf('month').startOf('day');

			while (firstDay <= lastDay) {
				days.push({
					date: firstDay,
					isToday: firstDay == today,
					isOver: firstDay < today,
					gridColumn: days.length === 0 ? firstDay.weekday : null, // 1 = Monday, 7 = Sunday, null = not first day of month
					status: 'loading',
				});
				firstDay = firstDay.plus({ days: 1 });
			}
			this.days = days;
		},
		retrieveStatus() {
			fetch(
				`/api/v1/calendars/month/${
					this.calendar._id
				}/${this.monthDate.toFormat('yyyy-MM')}`,
				{
					method: 'GET',
					headers: {
						Accept: 'application/json',
					},
				},
			)
				.then((res) => res.json())
				.then((res) => {
					for (const day of this.days) {
						day.status =
							res.days[day.date.toFormat('yyyy-MM-dd')] || 'fail';
					}
				})
				.catch(() => {
					console.log("Couldn't connect to server");
				});
		},
	},
	template: `
		<div class="calendar">
			<div class="calendar_header">
				<p class="name">{{ calendar.name }}</p>
				<div class="calendar_controls">
					<svg @click="prevMonth()" class="caret left"><use xlink:href="/public/icons/caret.svg#icon"></use></svg>
					<svg @click="currentMonth()" class="today"><use xlink:href="/public/icons/today.svg#icon"></use></svg>
					<svg @click="nextMonth()" class="caret right"><use xlink:href="/public/icons/caret.svg#icon"></use></svg>
				</div>
			</div>

			<div class="calendar_body">
				<div class="calendar_info">
					<p class="calendar_month">{{ monthString }}</p>
					<div class="streaks">
						<p>{{ currentStreak }}</p>
						<svg
							:class="{
								'expended': streakExpendedToday
							}"
						><use xlink:href="/public/icons/streak.svg#icon"></use></svg>
					</div>
				</div>

				<div class="calendar_days">
					<div v-for="dayLetter in daysLetters" class="calendar_dayname"><span>{{ dayLetter }}</span></div>

					<CalendarDayItem
						v-for="day in days"
						:key="day.date"
						:day-prop="day"
					/>
				</div>
			</div>
		</div>
	`,
};
