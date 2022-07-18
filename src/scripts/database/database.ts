import { connect, model, Schema, Model, Document, Types, SchemaTypes, ObjectId } from 'mongoose'
import chalk from 'chalk'
import dotenv from 'dotenv'

dotenv.config()

export interface IUser extends Document {
	username: string,
	password_hash: string,
	api_keys: Array<{
		_id: Types.ObjectId,
		name: string,
		key_hash: string
	}>,
	notifications: {
		matrix: {
			room_id: string
		}
	}
}
export interface ICalendar extends Document {
	name: string,
	user_id: Types.ObjectId,
	agenda: Array<boolean>,
	days: Map<string, string>
}

const	UserSchema: Schema = new Schema({
	username: { type: String, required: true, unique: true, index: true },
	password_hash: { type: String, required: true },
	api_keys: [{
		name: { type: String, required: true },
		key_hash: { type: String, required: true }
	}],
	notifications: {
		matrix: {
			room_id: { type: String }
		}
	}
})
export const	MUser: Model<IUser> = model<IUser>('User', UserSchema)

const	CalendarSchema: Schema = new Schema({
	name: { type: String, required: true },
	user_id: { type: SchemaTypes.ObjectId, required: true, ref: "User", index: true },
	agenda: { type: [Boolean], required: true },
	days: {
		type: Map,
		of: String
	}
})
export const	MCalendar: Model<ICalendar> = model<ICalendar>('Calendar', CalendarSchema)

/**
 * Connect mongoose to the MongoDB server using MONGO_URI env
 * @returns - The mongoose connection promises
 */
export function connectDB(): Promise<typeof import('mongoose')> {
	if (process.env.MONGO_URI != undefined)
		return connect(process.env.MONGO_URI)
	else {
		console.log(chalk.red("Please add a MONGO_URI in your .env"))
		process.exit(1)
	}
}
