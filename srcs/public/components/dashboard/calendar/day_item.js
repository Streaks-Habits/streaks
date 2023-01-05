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
	template: `
		<button @click="$emit('showSetState', $event)"
			class="calendar_day"
			:class="{
				'today': day.isToday === true,
				'future': day.isOver === false,
				[day.status]: true,
			}"
			:style="{
				gridColumn: day.gridColumn
			}"
			:disabled="!day.isOver"
		><span>{{ date }}</span></button>
	`,
};
