import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Role } from '../users/enum/roles.enum';
import { UserDoc } from '../users/schemas/user.schema';
import { Progress, ProgressDoc, RProgress } from './schemas/progress.schema';

export function asProgressAccess(
	user: UserDoc,
	progress: RProgress | ProgressDoc,
): void {
	let allowed = false;
	if (user.role == Role.Admin) allowed = true;

	// If progress is populated with user
	if (typeof progress.user == 'object') {
		if (progress.user._id.toString() == user._id.toString()) allowed = true;
	}
	// If progress is not populated with user
	else {
		if (progress.user == user._id.toString()) allowed = true;
	}

	if (!allowed)
		throw new UnauthorizedException(
			'you are not allowed to access this progress',
		);
}

export async function checkProgressAccess(
	user: UserDoc,
	progressId: string,
	ProgressModel: Model<Progress>,
): Promise<void> {
	const existingProgress = (await ProgressModel.findById(
		progressId,
		'user',
	)) as ProgressDoc;
	if (!existingProgress) throw new NotFoundException('Progress not found');

	asProgressAccess(user, existingProgress);
}
