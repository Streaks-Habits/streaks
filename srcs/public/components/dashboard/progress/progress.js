export default {
	props: {
		propProgress: {
			type: Object,
			required: true,
		},
		propDate: {
			// format: 'YYYY-MM-DD'
			type: String,
			required: false,
			default: luxon.DateTime.now().toISO(),
		},
	},
	data() {
		return {
			progress: this.propProgress,
			current_progress_percent: 0,
			referenceDate: luxon.DateTime.fromISO(this.propDate),
			recurrenceDelta: {},
			timeRangeName: '',
			addMeasure: {
				parentBox: null,
				show: false,
				loading: false,
				is_negative: false,
				value: 0,
				pos: {
					x: 0,
					y: 0,
				},
			},
			relativeDeadline: luxon.DateTime.fromISO(
				this.propProgress.deadline,
			).toRelative(),
		};
	},
	created() {
		window.addEventListener('resize', this.replaceAddMeasure);
		window.addEventListener('scroll', this.replaceAddMeasure);
		this.update();
		this.refreshInterval = setInterval(() => {
			this.fetch();
		}, 1000 * 60 * 5); // 5 minutes
	},
	beforeDestroy() {
		window.removeEventListener('resize', this.replaceAddMeasure);
		window.removeEventListener('scroll', this.replaceAddMeasure);
		clearInterval(this.refreshInterval);
	},
	computed: {},
	methods: {
		update() {
			this.current_progress_percent =
				((this.progress.current_progress || 0) / this.progress.goal) *
				100;

			switch (this.progress.recurrence_unit) {
				case 'daily':
					this.timeRangeName = this.referenceDate.toLocaleString(
						luxon.DateTime.DATE_MED,
					);
					this.recurrenceDelta = { days: 1 };
					break;
				case 'weekly':
					this.timeRangeName =
						this.referenceDate
							.startOf('week')
							.toLocaleString(luxon.DateTime.DATE_MED) +
						' - ' +
						this.referenceDate
							.endOf('week')
							.toLocaleString(luxon.DateTime.DATE_MED);
					this.recurrenceDelta = { weeks: 1 };
					break;
				case 'monthly':
					this.timeRangeName =
						this.referenceDate.toFormat('MMMM yyyy');
					this.recurrenceDelta = { months: 1 };
					break;
				case 'yearly':
					this.timeRangeName = this.referenceDate.toFormat('yyyy');
					this.recurrenceDelta = { years: 1 };
					break;
			}
		},
		async fetch() {
			const res = await fetch(
				`/api/v1/progresses/${
					this.progress._id
				}?date=${this.referenceDate.toFormat('yyyy-MM-dd')}`,
				{
					method: 'GET',
					headers: {
						Accept: 'application/json',
					},
				},
			);

			const data = await res.json();
			if (res.ok) {
				this.progress = data;
			} else if (data.hasOwnProperty('message')) {
				// TODO: show error to user
				console.error(res.message);
			} else {
				// TODO: show error to user
				console.error("Error while retrieving progress's status");
			}
			this.update();
		},
		previous() {
			this.referenceDate = this.referenceDate.minus(this.recurrenceDelta);
			this.fetch();
		},
		next() {
			this.referenceDate = this.referenceDate.plus(this.recurrenceDelta);
			this.fetch();
		},
		current() {
			this.referenceDate = luxon.DateTime.now();
			this.fetch();
		},
		async postMeasure() {
			this.addMeasure.loading = true;

			let forDate = luxon.DateTime.now();
			if (
				this.referenceDate.toFormat('yyyy-MM-dd') !==
				forDate.toFormat('yyyy-MM-dd')
			) {
				forDate = this.referenceDate;
			}

			const res = await fetch(
				`/api/v1/progresses/measures/${this.progress._id}/${
					this.addMeasure.value
				}?for=${forDate.toJSDate().toISOString()}`,
				{
					method: 'PUT',
					headers: {
						Accept: 'application/json',
					},
				},
			);

			const data = await res.json();
			if (res.ok) {
				this.progress = data;
				this.update();
			} else if (data.hasOwnProperty('message')) {
				// TODO: show error to user
				console.error(res.message);
			} else {
				// TODO: show error to user
				console.error("Error while adding a progress's measure");
			}

			this.hideAddMeasure(null);
		},
		showAddMeasure(e, is_negative = false) {
			if (is_negative) this.addMeasure.value = -1;
			else this.addMeasure.value = 1;

			// Find the box element
			const box = e.target.closest('.progress');
			this.addMeasure.parentBox = box;
			// Set position to the middle of the box
			this.replaceAddMeasure();

			this.addMeasure.loading = false;
			this.addMeasure.show = true;
			this.$nextTick(() => {
				this.$refs.addMeasureInput.select();
			});
		},
		replaceAddMeasure() {
			if (this.addMeasure.parentBox == null) return;
			this.addMeasure.pos.x =
				this.addMeasure.parentBox.getBoundingClientRect().x +
				this.addMeasure.parentBox.offsetWidth / 2;
			this.addMeasure.pos.y =
				this.addMeasure.parentBox.getBoundingClientRect().y +
				this.addMeasure.parentBox.offsetHeight / 2;
		},
		hideAddMeasure(e) {
			// Check that the click is outside the add measure box
			if (
				e != null &&
				e.target.closest('.add_measure_overlay') !== e.target
			)
				return;

			this.addMeasure.parentBox = null;
			this.addMeasure.show = false;
			this.addMeasure.loading = false;
		},
		numberToString(number, decimals = 0) {
			if (number % 1 === 0) return number.toString();
			return number.toFixed(decimals);
		},
		edit() {
			this.$emit('editor:edit', this.progress);
		},
	},
	template: `
		<div class="progress">
			<div class="add_measure_overlay" v-if="addMeasure.show" @click="hideAddMeasure($event)">
				<div
					class="add_measure_box"
					:style="{ top: addMeasure.pos.y + 'px', left: addMeasure.pos.x + 'px' }"
				>
					<svg v-show="addMeasure.loading" class="spinner"><use xlink:href="/public/icons/spinner.svg#icon"></use></svg>
					<form v-show="!addMeasure.loading" @submit.prevent="postMeasure()">
						<input ref="addMeasureInput" type="number" step="any" name="measure" v-model="addMeasure.value" />
						<button type="submit">Add measure</button>
					</form>
				</div>
			</div>

			<div class="header_wrapper">
				<div class="header">
					<button @click="showAddMeasure($event, true)" class="add_measure">
						<svg><use xlink:href="/public/icons/minus.svg#icon"></use></svg>
					</button>
					<p class="name">{{ progress.name }}</p>
					<button @click="showAddMeasure($event)" class="add_measure">
						<svg><use xlink:href="/public/icons/plus.svg#icon"></use></svg>
					</button>
				</div>
			</div>

			<div class="date_controls_wrapper">
				<div class="edit_and_range">
					<div class="controls">
						<button @click="edit()"><svg class="edit"><use xlink:href="/public/icons/edit.svg#icon"></use></svg></button>
					</div>
					<span class="time_range">{{ timeRangeName }}</span>
				</div>
				<div class="controls">
					<button @click="previous()"><svg class="caret left"><use xlink:href="/public/icons/caret.svg#icon"></use></svg></button>
					<button @click="current()"><svg class="today"><use xlink:href="/public/icons/today.svg#icon"></use></svg></button>
					<button @click="next()"><svg class="caret right"><use xlink:href="/public/icons/caret.svg#icon"></use></svg></button>
				</div>
			</div>

			<div class="progress_bar">
				<span class="progress_bar_label">{{ numberToString(current_progress_percent, 2) }} %</span>
				<div class="progress_bar_fill" :style="{ width: current_progress_percent + '%' }"></div>
			</div>

			<div class="progress_details">
				<div class="progress_details_col">
					<p title="goal">🎯 <b>{{ numberToString(progress.goal, 2) }}</b></p>
					<p title="current progress">📈 <b>{{ numberToString(progress.current_progress, 2) }}</b></p>
				</div>
				<div class="progress_details_col">
					<p title="recurrence unit">🔁 {{ progress.recurrence_unit }}</p>
					<p title="deadline">⏰ {{ relativeDeadline }}</p>
				</div>
			</div>

		</div>
	`,
};
