import { connect, model, Schema, Model, Document, Types, SchemaTypes } from 'mongoose'
import chalk from 'chalk'
import dotenv from 'dotenv'

dotenv.config()

export interface IUser extends Document {
	_id: Types.ObjectId,
	username: string,
	password_hash: string,
	api_keys: Array<{
		_id: Types.ObjectId,
		name: string,
		key_hash: string
	}>,
	notifications: {
		streaks_done: {
			enabled: boolean,
			sent_today: boolean,
			channel: 'matrix' | '',
		}
		matrix: {
			room_id: string,
			start_date: string, // HH:MM 24h // format
			end_date: string // HH:MM 24h // format
		}
	}
}
export interface ICalendar extends Document {
	_id: Types.ObjectId,
	name: string,
	user_id: Types.ObjectId,
	agenda: Array<boolean>,
	days: Map<string, string>,
	notifications: {
		reminders: boolean,
		congrats: boolean
	}
}

const	UserSchema: Schema = new Schema({
	username: { type: String, required: true, unique: true, index: true },
	password_hash: { type: String, required: true },
	api_keys: [{
		name: { type: String, required: true },
		key_hash: { type: String, required: true }
	}],
	notifications: {
		streaks_done: {
			enabled: { type: Boolean, required: true, default: false },
			sent_today: { type: Boolean, required: true, default: false },
			channel: { type: String, required: true, default: '' }
		},
		matrix: {
			room_id: { type: String },
			start_date: { type: String }, // HH:MM 24h // format
			end_date: { type: String } // HH:MM 24h // format
		}
	}
})
export const	MUser: Model<IUser> = model<IUser>('User', UserSchema)

const	CalendarSchema: Schema = new Schema({
	name: { type: String, required: true },
	user_id: { type: SchemaTypes.ObjectId, required: true, ref: 'User', index: true },
	agenda: { type: [Boolean], required: true },
	days: {
		type: Map,
		of: String
	},
	notifications: {
		reminders: Boolean,
		congrats: Boolean
	}
})
export const	MCalendar: Model<ICalendar> = model<ICalendar>('Calendar', CalendarSchema)

/**
 * Connect mongoose to the MongoDB server using MONGO_URI env
 *
 * @returns {Promise<typeof import('mongoose')>} - The mongoose connection promises
 */
export function connectDB(): Promise<typeof import('mongoose')> {
	if (process.env.MONGO_URI != undefined)
		return connect(process.env.MONGO_URI)
	else {
		console.log(chalk.red('Please add a MONGO_URI in your .env'))
		process.exit(1)
	}
}
