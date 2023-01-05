import Calendar from '/public/components/dashboard/calendar/calendar.js';

export default {
	components: {
		Calendar,
	},
	props: {
		user: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			calendars: [],
		};
	},
	created() {
		this.updateCalendars();
	},
	methods: {
		async updateCalendars() {
			let res = await fetch(`/api/v1/calendars/list/${this.user._id}`, {
				method: 'GET',
				headers: {
					Accept: 'application/json',
				},
			});

			if (res.ok) {
				res = await res.json();
				this.calendars = res;
			} else {
				// TODO: show error to user
				if (res.hasOwnProperty('message')) console.error(res.message);
				else console.error("Error while retrieving user's calendars");
			}
		},
	},
	template: `
		<div class="calendars">
			<Calendar v-for="calendar in calendars" :key="calendar._id" :calendarData="calendar" />
		</div>
	`,
};
