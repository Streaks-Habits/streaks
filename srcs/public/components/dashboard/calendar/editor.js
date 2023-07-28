import Toggle from '../ui/toggle.js';

export default {
	components: {
		Toggle,
	},
	props: {
		propsAction: {
			type: String, // 'add' or 'edit'
			required: true,
		},
		propsCalendar: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			calendar: this.propsCalendar,
			action: this.propsAction,
			daynames: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
			infoMessage: null,
			successMessage: null,
			errorMessage: null,
			lastSaved: null,
			saveTimeout: null,
		};
	},
	created() {
		document.body.classList.add('no-scroll');
		if (this.action === 'add') {
			this.calendar = {
				name: '',
				agenda: [true, true, true, true, true, false, false],
				notifications: {
					reminders: true,
					congrats: true,
				},
				enabled: true,
			};
		}

		console.log(this.calendar);
	},
	beforeDestroy() {
		document.body.classList.remove('no-scroll');
	},
	watch: {
		calendar: {
			handler() {
				this.successMessage = null;
				this.errorMessage = null;
				this.infoMessage = 'Saving...';

				if (this.saveTimeout) {
					clearTimeout(this.saveTimeout);
					this.saveTimeout = null;
				}
				this.saveTimeout = setTimeout(async () => {
					this.saveTimeout = null;
					await this.save();
				}, 2000);
			},
			deep: true,
		},
	},
	methods: {
		async save() {
			const res = await fetch('/api/v1/calendars/' + this.calendar._id, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: this.calendar.name,
					agenda: this.calendar.agenda,
					notifications: this.calendar.notifications,
					enabled: this.calendar.enabled,
				}),
			});

			const data = await res.json();

			this.infoMessage = null;
			this.successMessage = null;
			this.errorMessage = null;

			if (res.ok) {
				this.successMessage = 'Saved';
			} else if (data.hasOwnProperty('message')) {
				this.errorMessage = data.message;
			} else {
				this.errorMessage = 'Error while saving calendar';
			}
		},
	},
	template: `
		<div class="calendar-editor">
			<div class="calendar-editor-inner">
				<div>
					<button @click="$emit('editor:close')" class="close">
						<svg><use xlink:href="/public/icons/close.svg#icon"></use></svg>
					</button>
					<h1 v-if="action === 'add'">Add a calendar</h1>
					<h1 v-if="action === 'edit'">Edit <span>{{ calendar.name }}</span></h1>
					<p class="calendar-id">{{ calendar._id }}</p>
				</div>
				<form>
					<div class="form-group">
						<label for="name">Name</label>
						<input type="text" id="name" v-model="calendar.name" />
					</div>
					<div class="form-group">
						<p class="label">📅 Agenda</p>
						<div class="agenda-days">
							<div
								v-for="(day, index) in calendar.agenda"
								:key="index"
								class="agenda-day"
								v-bind:class="{ disabled: !day }"
								@click="calendar.agenda[index] = !calendar.agenda[index]"
							>
								<input type="checkbox" v-model="calendar.agenda[index]" />
								<label for="day">{{ daynames[index] }}</label>
							</div>
						</div>
					</div>
					<div class="form-group">
						<p class="group-title">🔔 Notification</p>
						<div class="form-group toggle-group">
							<Toggle id="reminders" :toggle="calendar.notifications.reminders" @update:toggle="calendar.notifications.reminders = $event" />
							<label for="reminders">Reminders</label>
						</div>
						<div class="form-group toggle-group">
							<Toggle id="congrats" :toggle="calendar.notifications.congrats" @update:toggle="calendar.notifications.congrats = $event" />
							<label for="congrats">Congratulations</label>
						</div>
					</div>
					<div class="form-group">
						<p class="group-title">⚙️ Settings</p>
						<div class="form-group toggle-group">
							<Toggle id="enabled" :toggle="calendar.enabled" @update:toggle="calendar.enabled = $event" />
							<label for="enabled">Enabled</label>
						</div>
					</div>
					<div class="info">
						<p class="info-message" v-if="infoMessage">{{ infoMessage }}</p>
						<p class="success-message" v-if="successMessage">{{ successMessage }}</p>
						<p class="error-message" v-if="errorMessage">{{ errorMessage }}</p>
					</div>
				</form>
			</div>
		</div>
	`,
};
