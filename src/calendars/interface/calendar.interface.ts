import { Types } from 'mongoose';

export interface ICalendar {
	_id: Types.ObjectId;
	name: string;
	user: Types.ObjectId;
	agenda?: Array<boolean>;
	days?: Map<string, string>;
}
