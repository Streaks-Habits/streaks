import { ObjectId } from 'mongodb';

export const ClassOmit = <T, K extends keyof T>(
	Class: new () => T,
	keys: K[],
): new () => Omit<T, (typeof keys)[number]> => Class;

export function isValidObjectId(id) {
	if (ObjectId.isValid(id)) {
		if (String(new ObjectId(id)) === id) return true;
		return false;
	}
	return false;
}

export function sortMapByKeys(map) {
	return new Map(
		[...map.entries()].sort((a, b) => {
			if (a[0] < b[0]) return -1;
			if (a[0] > b[0]) return 1;
			return 0;
		}),
	);
}
