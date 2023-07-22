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
		};
	},
	created() {
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
	watch: {
		calendar: {
			handler() {
				console.log(this.calendar);
			},
			deep: true,
		},
	},
	template: `
		<div class="calendar-editor">
			<h1 v-if="action === 'add'">Add a calendar</h1>
			<h1 v-if="action === 'edit'">Edit {{ calendar.name }}</h1>
			<form>
				<div class="form-group">
					<label for="name">Name</label>
					<input type="text" id="name" v-model="calendar.name" />
				</div>
				<div class="form-group">
					<p>Agenda</p>
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
					<p>Notification</p>
					<div class="form-group">
						<label for="reminders">Reminders</label>
						<Toggle id="reminders" :toggle="calendar.notifications.reminders" @update:toggle="calendar.notifications.reminders = $event" />
					</div>
					<div class="form-group">
						<label for="congrats">Congratulations</label>
						<Toggle id="congrats" :toggle="calendar.notifications.congrats" @update:toggle="calendar.notifications.congrats = $event" />
					</div>
				</div>
				<div class="form-group">
					<label for="enabled">Enabled</label>
					<Toggle id="enabled" :toggle="calendar.enabled" @update:toggle="calendar.enabled = $event" />
				</div>
		</div>
	`,
};
