export default {
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
		};
	},
	created() {
		if (this.action === 'add') {
			this.calendar = {
				name: '',
				agenda: [true, true, true, true, true, false, false],
				notifications: {
					reminders: true,
					congratulations: true,
				},
				enabled: true,
			};
		}

		console.log(this.calendar);
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
						<div class="form-group">
							<label for="monday">Monday</label>
							<input type="checkbox" id="monday" v-model="calendar.agenda[0]" />
							<label for="tuesday">Tuesday</label>
							<input type="checkbox" id="tuesday" v-model="calendar.agenda[1]" />
							<label for="wednesday">Wednesday</label>
							<input type="checkbox" id="wednesday" v-model="calendar.agenda[2]" />
							<label for="thursday">Thursday</label>
							<input type="checkbox" id="thursday" v-model="calendar.agenda[3]" />
							<label for="friday">Friday</label>
							<input type="checkbox" id="friday" v-model="calendar.agenda[4]" />
							<label for="saturday">Saturday</label>
							<input type="checkbox" id="saturday" v-model="calendar.agenda[5]" />
							<label for="sunday">Sunday</label>
							<input type="checkbox" id="sunday" v-model="calendar.agenda[6]" />
					</div>
				</div>
				<div class="form-group">
					<p>Notification</p>
					<div class="form-group">
						<label for="reminders">Reminders</label>
						<input type="checkbox" id="reminders" v-model="calendar.notifications.reminders" />
					</div>
					<div class="form-group">
						<label for="congratulations">Congratulations</label>
						<input type="checkbox" id="congratulations" v-model="calendar.notifications.congratulations" />
					</div>
				</div>
				<div class="form-group">
					<label for="enabled">Enabled</label>
					<input type="checkbox" id="enabled" v-model="calendar.enabled" />
				</div>
		</div>
	`,
};
