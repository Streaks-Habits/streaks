export default {
	props: {
		dayProp: {
			// { date: Luxon Date, isToday: boolean, gridColumn: number }
			type: Object,
			required: true,
		},
	},
	computed: {
		date() {
			return luxon.DateTime.fromISO(this.day.date).day;
		},
		day() {
			return this.dayProp;
		},
	},
	methods: {
		setState() {
			console.log('setState, day:', this.date, this.day.status);
		},
	},
	template: `
		<button @click="setState()"
			class="calendar_day"
			:class="{
				'today': day.isToday,
				'future': !day.isOver,
				[day.status]: true,
			}"
			:style="{
				gridColumn: day.gridColumn
			}"
			:disabled="!day.isOver"
		><span>{{ date }}</span></button>
	`,
};
