import { nextTick } from '/public/libs/vue.esm-browser.prod.js';

import CalendarDayItem from '/public/components/dashboard/calendar/day_item.js';

export default {
	components: {
		CalendarDayItem,
	},
	props: {
		isDemo: {
			type: Boolean,
			required: false,
			default: false,
		},
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
			setState: {
				show: false,
				date: undefined,
				loading: false,
				pos: {
					x: 0,
					y: 0,
				},
			},
			demoCache: {}, // To store demo data (days states)
		};
	},
	created() {
		this.updateMonth();
		if (!this.isDemo) {
			this.refreshInterval = setInterval(() => {
				this.updateMonth();
			}, 1000 * 60 * 5); // 5 minutes
		}
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
	beforeDestroy() {
		clearInterval(this.refreshInterval);
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
					isOver: firstDay <= today,
					gridColumn: days.length === 0 ? firstDay.weekday : null, // 1 = Monday, 7 = Sunday, null = not first day of month
					status: 'loading',
				});
				firstDay = firstDay.plus({ days: 1 });
			}
			this.days = days;
		},
		async retrieveStatus() {
			if (this.isDemo) {
				const month = this.monthDate.toFormat('yyyy-MM');
				// If current month is not in cache, create it
				if (!this.demoCache.hasOwnProperty(month)) {
					this.demoCache[month] = {};
					for (const day of this.days) {
						const status = ['success', 'freeze', 'fail'][
							Math.floor(Math.random() * 3)
						];
						this.demoCache[month][day.date.toFormat('yyyy-MM-dd')] =
							status;
					}
				}

				// Set days status from cache
				for (const day of this.days) {
					day.status =
						this.demoCache[this.monthDate.toFormat('yyyy-MM')][
							day.date.toFormat('yyyy-MM-dd')
						];
				}
				this.computeDemoStreak();
				return;
			}

			const res = await fetch(
				`/api/v1/calendars/month/${
					this.calendar._id
				}?month=${this.monthDate.toFormat('yyyy-MM')}`,
				{
					method: 'GET',
					headers: {
						Accept: 'application/json',
					},
				},
			);

			const data = await res.json();
			if (res.ok) {
				this.days = this.days.map((day) => {
					if (data.hasOwnProperty('days'))
						day.status =
							data.days[day.date.toFormat('yyyy-MM-dd')] ||
							'fail';
					else day.status = 'fail';
					return day;
				});
			} else if (data.hasOwnProperty('message')) {
				// TODO: show error to user
				console.error(res.message);
			} else {
				// TODO: show error to user
				console.error("Error while retrieving calendar's status");
			}
		},
		async setDayState(state) {
			this.setState.loading = true;

			let dayToSet = undefined;
			for (const day of this.days) {
				if (day.date == this.setState.date) {
					dayToSet = day;
					break;
				}
			}

			if (!dayToSet) {
				this.hideSetState(null);
				return;
			}

			if (this.isDemo) {
				this.hideSetState(null);
				dayToSet.status = state;
				// Update demo cache
				this.demoCache[this.monthDate.toFormat('yyyy-MM')][
					dayToSet.date.toFormat('yyyy-MM-dd')
				] = state;
				this.computeDemoStreak();
				return;
			}

			dayToSet.status = 'loading';
			const res = await fetch(
				`/api/v1/calendars/state/${
					this.calendar._id
				}/${state}?for=${dayToSet.date.toFormat('yyyy-MM-dd')}`,
				{
					method: 'POST',
					headers: {
						Accept: 'application/json',
					},
				},
			);

			const data = await res.json();
			if (res.ok) {
				dayToSet.status = state;
				this.calendar.current_streak = data.current_streak;
				this.calendar.streak_expended_today =
					data.streak_expended_today;
			} else if (data.hasOwnProperty('message')) {
				// TODO: show error to user
				console.error(res.message);
			} else {
				// TODO: show error to user
				console.error("Error while setting day's state");
			}
			this.hideSetState(null);
		},
		async computeDemoStreak() {
			// Compute streak from cache
			this.calendar.current_streak = 0;
			this.calendar.streak_expended_today = false;

			const today = luxon.DateTime.now().endOf('day');
			let month = luxon.DateTime.now().toFormat('yyyy-MM');

			// Read every month starting from current month
			let fail = false;
			while (this.demoCache.hasOwnProperty(month)) {
				const endOfMonth = luxon.DateTime.fromISO(month).endOf('month');
				const startOfMonth =
					luxon.DateTime.fromISO(month).startOf('month');

				// Read every day starting from the last day of the month
				let day = endOfMonth;

				// If today if before the last day of the month, start from today
				if (day > today) day = today;

				while (day >= startOfMonth) {
					const dayString = day.toISODate();
					if (this.demoCache[month][dayString] === 'success') {
						this.calendar.current_streak++;
						if (day === today) {
							this.calendar.streak_expended_today = true;
						}
					} else if (this.demoCache[month][dayString] === 'fail') {
						fail = true;
						break;
					}

					day = day.minus({ days: 1 });
				}

				if (fail) break;

				// Go to previous month
				month = luxon.DateTime.fromISO(month)
					.minus({ months: 1 })
					.toFormat('yyyy-MM');
			}
		},
		hideSetState(e) {
			// Check that the click is outside the set state box
			if (
				e != null &&
				e.target.closest('.set_state_overlay') !== e.target
			)
				return;

			document.body.style.paddingRight = '';
			document.body.classList.remove('no-scroll');
			this.setState.show = false;
			this.setState.date = undefined;
			this.setState.loading = false;
			this.setState.pos.x = 0;
			this.setState.pos.y = 0;
		},
		async showSetState(x, y, day) {
			document.body.style.paddingRight = getScrollbarWidth() + 'px';
			document.body.classList.add('no-scroll');

			this.setState.show = true;
			this.setState.date = day.date;

			await nextTick();

			// Ensure that the box is not outside the screen
			const box = this.$refs.setStateBox;
			const boxWidth = box.offsetWidth;
			const boxHeight = box.offsetHeight;
			const screenWidth = window.innerWidth;
			const screenHeight = window.innerHeight;
			const margin = 10;

			if (x + boxWidth + margin > screenWidth)
				x = screenWidth - boxWidth - margin;
			if (y + boxHeight + margin > screenHeight)
				y = screenHeight - boxHeight - margin;

			this.setState.pos.x = x;
			this.setState.pos.y = y;
		},
		edit() {
			this.$emit('editor:edit', this.calendar);
		},
	},
	template: `
		<div class="calendar">
			<div class="set_state_overlay" v-if="setState.show" @click="hideSetState($event)">
				<div
					class="set_state_box"
					ref="setStateBox"
					:style="{ left: this.setState.pos.x + 'px', top: this.setState.pos.y + 'px' }"
				>
					<svg v-show="this.setState.loading" class="spinner"><use xlink:href="/public/icons/spinner.svg#icon"></use></svg>
					<button
						v-show="!this.setState.loading"
						@click="setDayState('success')"
						class="set_success"
					>
						SUCCESS
					</button>
					<button
						v-show="!this.setState.loading"
						@click="setDayState('freeze')"
						class="set_freeze"
					>
						FREEZE
					</button>
					<button
						v-show="!this.setState.loading"
						@click="setDayState('fail')"
						class="set_fail"
					>
						FAIL
					</button>
				</div>
			</div>

			<div class="header">
				<p class="name">{{ calendar.name }}</p>
				<div class="controls">
					<button @click="prevMonth()"><svg class="caret left"><use xlink:href="/public/icons/caret.svg#icon"></use></svg></button>
					<button @click="currentMonth()"><svg class="today"><use xlink:href="/public/icons/today.svg#icon"></use></svg></button>
					<button @click="nextMonth()"><svg class="caret right"><use xlink:href="/public/icons/caret.svg#icon"></use></svg></button>
				</div>
			</div>

			<div class="calendar_body">
				<div class="calendar_info">
					<div class="edit_and_month">
						<div class="controls">
							<button @click="edit()"><svg class="edit"><use xlink:href="/public/icons/edit.svg#icon"></use></svg></button>
						</div>
						<p class="calendar_month">{{ monthString }}</p>
					</div>
					<div class="streaks">
						<p>{{ this.calendar.current_streak }}</p>
						{{ this.calendar.streak_expended }}
						<svg
							:class="{
								'expended': this.calendar.streak_expended_today === true,
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
						@show-set-state="(event) => {
							this.showSetState(event.clientX, event.clientY, day);
						}"
					/>
				</div>
			</div>
		</div>
	`,
};
