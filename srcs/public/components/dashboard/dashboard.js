import Calendar from '/public/components/dashboard/calendar/calendar.js';
import DisabledCalendar from '/public/components/dashboard/calendar/disabled_calendar.js';
import Progress from '/public/components/dashboard/progress/progress.js';
import DisabledProgress from '/public/components/dashboard/progress/disabled_progress.js';
import Editor from '/public/components/dashboard/editor.js';

export default {
	components: {
		Calendar,
		DisabledCalendar,
		Editor,
		Progress,
		DisabledProgress,
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
			calendars: {
				enabled: [],
				disabled: [],
			},
			editor: {
				action: null, // 'add', 'edit' or null
				type: null, // 'calendar' or 'progress'
				properties: {},
			},
			progresses: {
				enabled: [],
				disabled: [],
			},
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
			notification: '',
		};
	},
	created() {
		this.sentence =
			this.sentences[this.randInt(0, this.sentences.length - 1)];
		this.calendars_title = this.generateTitle(this.calendars_title);
		this.progresses_title = this.generateTitle(this.progresses_title);
		this.updateCalendars();
		this.updateProgresses();
		this.setNotification();
	},
	watch: {
		calendars: {
			handler() {
				this.setNotification();
			},
			deep: true,
		},
	},
	methods: {
		randInt(min, max) {
			return Math.floor(Math.random() * (max - min + 1)) + min;
		},
		generateTitle(title) {
			// Add a span at a random position in the title that wraps a random number of characters
			const span = document.createElement('span');
			const randomIndex = this.randInt(0, title.length - 1);
			const randomLength = this.randInt(4, title.length - randomIndex);

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

			this.calendars.enabled = [];
			this.calendars.disabled = [];

			if (res.ok) {
				res = await res.json();
				for (const calendar of res) {
					if (calendar.enabled) this.calendars.enabled.push(calendar);
					else this.calendars.disabled.push(calendar);
				}
			} else {
				if (res.status === 404) return;
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

			this.progresses.enabled = [];
			this.progresses.disabled = [];

			if (res.ok) {
				res = await res.json();
				for (const progress of res) {
					if (progress.enabled)
						this.progresses.enabled.push(progress);
					else this.progresses.disabled.push(progress);
				}
			} else {
				if (res.status === 404) return;
				// TODO: show error to user
				if (res.hasOwnProperty('message')) console.error(res.message);
				else console.error("Error while retrieving user's progresses");
			}
		},
		addCalendar() {
			this.editor.action = 'add';
			this.editor.type = 'calendar';
			this.editor.properties = {};
		},
		editCalendar(calendar) {
			this.editor.action = 'edit';
			this.editor.type = 'calendar';
			this.editor.properties = calendar;
		},
		addProgress() {
			this.editor.action = 'add';
			this.editor.type = 'progress';
			this.editor.properties = {};
		},
		editProgress(progress) {
			this.editor.action = 'edit';
			this.editor.type = 'progress';
			this.editor.properties = progress;
		},
		closeEditor() {
			this.editor.action = null;
			this.editor.type = null;
			this.editor.properties = {};
			document.body.classList.remove('no-scroll');
			this.updateCalendars();
			this.updateProgresses();
		},
		setNotification() {
			// If every calendar have a success for today, return a success notification

			let success = true;
			let enabled = false;
			for (const calendar of this.calendars.enabled) {
				if (!calendar.enabled) continue;
				enabled = true;
				if (!calendar.streak_expended_today) {
					success = false;
					break;
				}
			}

			if (success && enabled)
				this.notification = '🎉 All the streaks are done!! 🎉';
			else if (!enabled)
				this.notification = ''; // The user has no calendars
			else this.notification = '⏰ You still have work to do!';
		},
	},
	template: `
		<p class="sentence">{{ sentence }}</p>
		<p class="notification" v-if="notification">{{ notification }}</p>

		<div class="title">
			<button @click="addCalendar">+</button>
			<h1 v-html="calendars_title"></h1>
		</div>
		<div class="calendars" v-if="calendars.enabled.length">
			<Calendar v-for="calendar in calendars.enabled" :key="calendar._id" :calendarData="calendar" @editor:edit="editCalendar" />
		</div>
		<div class="no-calendars" v-else>
			<p>You don't have any calendars yet.</p>
			<p>Click the <span>+</span> button above to add one.</p>
		</div>

		<div class="title">
			<button @click="addProgress">+</button>
			<h1 v-html="progresses_title"></h1>
		</div>
		<div class="progresses" v-if="progresses.enabled.length">
			<Progress v-for="progress in progresses.enabled" :key="progress._id" :propProgress="progress" @editor:edit="editProgress" />
		</div>
		<div class="no-progresses" v-else>
			<p>You don't have any progresses yet.</p>
			<p>Click the <span>+</span> button above to add one.</p>
		</div>

		<h1 v-if="calendars.disabled.length" class="disabled">Disabled Calendars</h1>
		<div class="calendars disabled" v-if="calendars.disabled.length">
			<DisabledCalendar v-for="calendar in calendars.disabled" :key="calendar._id" :calendarData="calendar" @editor:edit="editCalendar" />
		</div>

		<h1 v-if="progresses.disabled.length" class="disabled">Disabled Progresses</h1>
		<div class="progresses disabled" v-if="progresses.disabled.length">
			<DisabledProgress v-for="progresse in progresses.disabled" :key="progresse._id" :progressData="progresse" @editor:edit="editProgress" />
		</div>

		<Editor v-if="editor.action" :propsAction="editor.action" :propsProperties="editor.properties" :propsType="editor.type" :propsUser="user" @editor:close="closeEditor" />

		<a href="/logout" class="logout">
			<svg><use xlink:href="/public/icons/logout.svg#icon"></use></svg>
		</a>
	`,
};
