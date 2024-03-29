import Toggle from '../ui/toggle.js';
import LoadingButton from '../ui/loadingButton.js';
import Select from '../ui/select.js';

export default {
	components: {
		Toggle,
		LoadingButton,
		Select,
	},
	props: {
		propsAction: {
			type: String, // 'add' or 'edit'
			required: true,
		},
		propsType: {
			type: String, // 'calendar' or 'progress'
			required: true,
		},
		propsProperties: {
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
			properties: this.propsProperties,
			propertiesId: this.propsProperties._id, // Separate to avoid triggering watcher
			action: this.propsAction,
			user: this.propsUser,
			type: this.propsType,
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
			if (this.type === 'calendar') {
				this.properties = {
					name: '🗓️ My calendar',
					agenda: [true, true, true, true, true, false, false],
					notifications: {
						reminders: true,
						congrats: true,
					},
					enabled: true,
				};
			} else if (this.type === 'progress') {
				this.properties = {
					name: '📈 My progress',
					recurrence_unit: 'daily', // daily, weekly, monthly, yearly
					goal: 1,
					enabled: true,
				};
			}
		}
	},
	beforeDestroy() {
		document.body.classList.remove('no-scroll');
	},
	watch: {
		properties: {
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

			if (this.type === 'calendar') {
				// CALENDAR
				if (this.action === 'add') {
					res = await fetch('/api/v1/calendars', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							name: this.properties.name,
							agenda: this.properties.agenda,
							notifications: this.properties.notifications,
							enabled: this.properties.enabled,
							user: this.user._id,
						}),
					});
				} else {
					res = await fetch(
						'/api/v1/calendars/' + this.propertiesId,
						{
							method: 'PUT',
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({
								name: this.properties.name,
								agenda: this.properties.agenda,
								notifications: this.properties.notifications,
								enabled: this.properties.enabled,
							}),
						},
					);
				}
			} else if (this.type === 'progress') {
				// PROGRESS
				if (this.action === 'add') {
					res = await fetch('/api/v1/progresses', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							name: this.properties.name,
							recurrence_unit: this.properties.recurrence_unit,
							goal: this.properties.goal,
							enabled: this.properties.enabled,
							user: this.user._id,
						}),
					});
				} else {
					res = await fetch(
						'/api/v1/progresses/' + this.propertiesId,
						{
							method: 'PUT',
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({
								name: this.properties.name,
								recurrence_unit:
									this.properties.recurrence_unit,
								goal: this.properties.goal,
								enabled: this.properties.enabled,
							}),
						},
					);
				}
			}

			const data = await res.json();

			this.resetInfo();

			if (res.ok) {
				this.successMessage = 'Saved';
				if (this.action === 'add') {
					this.action = 'edit';
					this.propertiesId = data._id;
				}
			} else if (data.hasOwnProperty('message')) {
				this.errorMessage = data.message;
			} else {
				if (this.type === 'calendar') {
					this.errorMessage = 'Error while saving calendar';
				} else if (this.type === 'progress') {
					this.errorMessage = 'Error while saving progress';
				}
			}
		},
		openDeleteConfirm() {
			this.action = 'delete';
			this.resetInfo();
		},
		async del() {
			this.deleteIsLoading = true;
			let res;

			if (this.type === 'calendar') {
				// CALENDAR
				res = await fetch('/api/v1/calendars/' + this.properties._id, {
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json',
					},
				});
			} else if (this.type === 'progress') {
				// PROGRESS
				res = await fetch('/api/v1/progresses/' + this.properties._id, {
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json',
					},
				});
			}

			const data = await res.json();

			this.resetInfo();

			if (res.ok) {
				this.$emit('editor:close');
			} else if (data.hasOwnProperty('message')) {
				this.errorMessage = data.message;
			} else {
				if (this.type === 'calendar') {
					this.errorMessage = 'Error while deleting calendar';
				} else if (this.type === 'progress') {
					this.errorMessage = 'Error while deleting progress';
				}
			}
		},
	},
	template: `
		<div class="editor">
			<div class="editor-inner">
				<div>
					<button @click="$emit('editor:close')" class="close">
						<svg><use xlink:href="/public/icons/close.svg#icon"></use></svg>
					</button>
					<h1 v-if="action === 'add' && type === 'calendar'">Add a new calendar</h1>
					<h1 v-if="action === 'add' && type === 'progress'">Add a new progress</h1>
					<h1 v-if="action === 'edit' && type === 'calendar'">Edit <span>{{ properties.name }}</span></h1>
					<h1 v-if="action === 'edit' && type === 'progress'">Edit <span>{{ properties.name }}</span></h1>
					<p class="id">{{ properties._id }}</p>
				</div>
				<form @submit.prevent="save">
					<div class="form-group">
						<label for="name">Name</label>
						<input type="text" id="name" v-model="properties.name" />
					</div>
					<div class="form-group" v-if="type === 'calendar'">
						<p class="group-title">📅 Agenda</p>
						<div class="agenda-days">
							<div
								v-for="(day, index) in properties.agenda"
								:key="index"
								class="agenda-day"
								v-bind:class="{ disabled: !day }"
								@click="properties.agenda[index] = !properties.agenda[index]"
							>
								<input type="checkbox" v-model="properties.agenda[index]" />
								<label for="day">{{ daynames[index] }}</label>
							</div>
						</div>
					</div>
					<div class="form-group" v-if="type === 'calendar'">
						<p class="group-title">🔔 Notification</p>
						<div class="form-group toggle-group">
							<Toggle id="reminders" :toggle="properties.notifications.reminders" @update:toggle="properties.notifications.reminders = $event" />
							<label for="reminders">Reminders</label>
						</div>
						<div class="form-group toggle-group">
							<Toggle id="congrats" :toggle="properties.notifications.congrats" @update:toggle="properties.notifications.congrats = $event" />
							<label for="congrats">Congratulations</label>
						</div>
					</div>
					<div class="form-group" v-if="type === 'progress'">
						<label for="recurrence_unit">🔁 Recurrence unit</label>
						<Select :options="['daily', 'weekly', 'monthly', 'yearly']" :default="properties.recurrence_unit" @update:select="properties.recurrence_unit = $event" />
					</div>
					<div class="form-group" v-if="type === 'progress'">
						<label for="goal">🎯 Goal</label>
						<input type="number" step="any" id="goal" v-model="properties.goal" />
					</div>
					<div class="form-group">
						<p class="group-title">⚙️ Settings</p>
						<div class="form-group toggle-group">
							<Toggle id="enabled" :toggle="properties.enabled" @update:toggle="properties.enabled = $event" />
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
				<h1>Delete <span>{{ properties.name }}</span>?</h1>
				<p>This action cannot be undone.</p>
				<div class="buttons">
					<button @click="action = 'edit'" class="cancel">Cancel</button>
					<LoadingButton :loading="deleteIsLoading" :text="'Delete'" :type="'button'" @click="del" />
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
