import Calendar from '/public/components/dashboard/calendar/calendar.js';
import Progress from '/public/components/dashboard/progress/progress.js';

export default {
	components: {
		Calendar,
		Progress,
	},
	props: {
		user: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			calendars_title: 'Calendars',
			progresses_title: 'Progresses',
			calendars: [],
			progresses: [],
			sentences: [
				"One day at a time. You've got this!",
				"Don't let a single day pass without making progress.",
				'Small steps lead to big achievements. Keep working towards your goals.',
				'Today is a new opportunity to succeed.',
				'Every day is a chance to improve and grow. Make the most of it.',
				'Small changes can lead to big improvements. Keep going!',
				'Every day is a new opportunity to make progress towards your goals.',
				'Remember why you started and let that motivation carry you forward.',
				"Don't let setbacks discourage you. Keep pushing through and making progress.",
				"Don't give up on your goals. Keep working towards them every day.",
				"Keep up the hard work and don't be afraid to celebrate your progress.",
				"You've got this! Keep working towards your goals every day.",
				'Consistency is key. Keep up the good work.',
			],
			sentence: '',
		};
	},
	created() {
		this.sentence =
			this.sentences[this.randInt(0, this.sentences.length - 1)];
		this.calendars_title = this.generateTitle(this.calendars_title);
		this.progresses_title = this.generateTitle(this.progresses_title);
		this.updateCalendars();
		this.updateProgresses();
	},
	methods: {
		randInt(min, max) {
			return Math.floor(Math.random() * (max - min + 1)) + min;
		},
		generateTitle(title) {
			// Add a span at a random position in the title that wraps a random number of characters
			const span = document.createElement('span');
			const randomIndex = this.randInt(0, title.length - 1);
			const randomLength = this.randInt(2, title.length - randomIndex);

			span.innerText = title.substr(randomIndex, randomLength);
			return (
				title.substr(0, randomIndex) +
				span.outerHTML +
				title.substr(randomIndex + randomLength)
			);
		},
		async updateCalendars() {
			let res = await fetch(`/api/v1/calendars/user/${this.user._id}`, {
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
		async updateProgresses() {
			let res = await fetch(`/api/v1/progresses/user/${this.user._id}`, {
				method: 'GET',
				headers: {
					Accept: 'application/json',
				},
			});

			if (res.ok) {
				res = await res.json();
				this.progresses = res;
			} else {
				// TODO: show error to user
				if (res.hasOwnProperty('message')) console.error(res.message);
				else console.error("Error while retrieving user's progresses");
			}
		},
	},
	template: `
		<p class="sentence">{{ sentence }}</p>
		<h1 v-if="calendars.length" v-html="calendars_title"></h1>
		<div class="calendars" v-if="calendars.length">
			<Calendar v-for="calendar in calendars" :key="calendar._id" :calendarData="calendar" />
		</div>
		<h1 v-if="progresses.length" v-html="progresses_title"></h1>
		<div class="progresses" v-if="progresses.length">
			<Progress v-for="progress in progresses" :key="progress._id" :propProgress="progress" />
		</div>
	`,
};
