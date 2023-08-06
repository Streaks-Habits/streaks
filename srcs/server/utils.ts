import { ConfigService } from '@nestjs/config';
import { ObjectId } from 'mongodb';
import { UsersService } from './users/users.service';

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

export async function areRegistrationsEnabled(
	configService: ConfigService,
	usersService: UsersService,
) {
	// Get env, true if not set
	const envVal = configService.get('REGISTRATIONS_ENABLED') || 'true';
	if (envVal !== 'true' && envVal !== 'false') {
		console.error('REGISTRATIONS_ENABLED env variable is not a boolean');
		process.exit(1);
	}

	// If env is false and there are users, return false
	if (envVal === 'false' && (await usersService.count()) > 0) return false;
	return true;
}

export function isDemoUserEnabled(configService: ConfigService) {
	// Get env, true if not set
	const envVal = configService.get('DEMO_USER_ENABLED') || 'false';
	if (envVal !== 'true' && envVal !== 'false') {
		console.error('DEMO_USER_ENABLED env variable is not a boolean');
		process.exit(1);
	}

	return envVal === 'true';
}
