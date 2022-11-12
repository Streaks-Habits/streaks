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
		console.log('dashboard created');
		this.updateCalendars();
	},
	methods: {
		updateCalendars() {
			fetch(`/api/v1/calendars/list`, {
				method: 'GET',
				headers: {
					Accept: 'application/json',
				},
			})
				.then((res) => res.json())
				.then((res) => {
					console.log('calendars:', res);

					if (!Array.isArray(res)) {
						// TODO: error message
					}
					this.calendars = res;
				})
				.catch(() => {
					console.log("Couldn't connect to server");
				});
		},
	},
	template: `
		<div class="calendars">
			<Calendar v-for="calendar in calendars" :key="calendar._id" :calendarData="calendar" />
		</div>
	`,
};
