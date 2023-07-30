import Toggle from '../../ui/toggle.js';
import LoadingButton from '../../ui/loadingButton.js';

export default {
	components: {
		Toggle,
		LoadingButton,
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
		propsUser: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			calendar: this.propsCalendar,
			calendarId: this.propsCalendar._id, // Separate to avoid triggering watcher
			action: this.propsAction,
			user: this.propsUser,
			daynames: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
			infoMessage: null,
			successMessage: null,
			errorMessage: null,
			lastSaved: null,
			saveTimeout: null,
			isLoading: false,
			deleteIsLoading: false,
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
	},
	beforeDestroy() {
		document.body.classList.remove('no-scroll');
	},
	watch: {
		calendar: {
			deep: true,
			handler() {
				if (this.action !== 'edit') return;

				this.successMessage = null;
				this.errorMessage = null;
				this.infoMessage = 'Saving...';
				this.isLoading = true;

				if (this.saveTimeout) {
					clearTimeout(this.saveTimeout);
					this.saveTimeout = null;
				}
				this.saveTimeout = setTimeout(async () => {
					this.saveTimeout = null;
					await this.save();
				}, 2000);
			},
		},
	},
	methods: {
		resetInfo() {
			this.infoMessage = null;
			this.successMessage = null;
			this.errorMessage = null;
			this.isLoading = false;
			this.deleteIsLoading = false;
		},
		async save() {
			this.isLoading = true;
			let res;

			if (this.action === 'add') {
				res = await fetch('/api/v1/calendars', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						name: this.calendar.name,
						agenda: this.calendar.agenda,
						notifications: this.calendar.notifications,
						enabled: this.calendar.enabled,
						user: this.user._id,
					}),
				});
			} else {
				res = await fetch('/api/v1/calendars/' + this.calendarId, {
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
			}

			const data = await res.json();

			this.resetInfo();

			if (res.ok) {
				this.successMessage = 'Saved';
				if (this.action === 'add') {
					this.action = 'edit';
					this.calendarId = data._id;
				}
			} else if (data.hasOwnProperty('message')) {
				this.errorMessage = data.message;
			} else {
				this.errorMessage = 'Error while saving calendar';
			}
		},
		openDeleteConfirm() {
			this.action = 'delete';
			this.resetInfo();
		},
		async deleteCalendar() {
			this.deleteIsLoading = true;

			const res = await fetch('/api/v1/calendars/' + this.calendar._id, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			const data = await res.json();

			this.resetInfo();

			if (res.ok) {
				this.$emit('editor:close');
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
				<form @submit.prevent="save">
					<div class="form-group">
						<label for="name">Name</label>
						<input type="text" id="name" v-model="calendar.name" />
					</div>
					<div class="form-group">
						<p class="group-title">📅 Agenda</p>
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

					<LoadingButton v-if=" action === 'add' " :loading="isLoading" :text="'Save'" :type="'submit'" />

					<button v-if=" action === 'edit' " class="delete" @click="openDeleteConfirm">
						<svg><use xlink:href="/public/icons/trash.svg#icon"></use></svg>
						Delete
					</button>

					<div class="information" :class="{ 'info': infoMessage, 'success': successMessage, 'error': errorMessage }">
						<svg v-show="isLoading" class="spinner"><use xlink:href="/public/icons/spinner.svg#icon"></use></svg>
						<p class="info-message" v-if="infoMessage">{{ infoMessage }}</p>
						<p class="success-message" v-if="successMessage">{{ successMessage }}</p>
						<p class="error-message" v-if="errorMessage">{{ errorMessage }}</p>
					</div>
				</form>
			</div>
		</div>
		<div class="delete-confirm-popup" v-if="action === 'delete'">
			<div class="delete-confirm-popup-inner">
				<h1>Delete <span>{{ calendar.name }}</span>?</h1>
				<p>This action cannot be undone.</p>
				<div class="buttons">
					<button @click="action = 'edit'" class="cancel">Cancel</button>
					<LoadingButton :loading="deleteIsLoading" :text="'Delete'" :type="'button'" @click="deleteCalendar" />
				</div>

				<div class="information" :class="{ 'info': infoMessage, 'success': successMessage, 'error': errorMessage }">
					<p class="info-message" v-if="infoMessage">{{ infoMessage }}</p>
					<p class="success-message" v-if="successMessage">{{ successMessage }}</p>
					<p class="error-message" v-if="errorMessage">{{ errorMessage }}</p>
				</div>
			</div>
		</div>
	`,
};
