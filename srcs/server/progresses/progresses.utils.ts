import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Role } from '../users/enum/roles.enum';
import { UserDoc } from '../users/schemas/user.schema';
import { Progress, ProgressDoc, RProgress } from './schemas/progress.schema';

export function asProgressAccess(
	user: UserDoc,
	progress: RProgress | ProgressDoc,
): void {
	if (user.role == Role.Admin) return;

	if (!progress.user)
		throw new UnauthorizedException('this progress is not owned');

	let progressUser: string;
	if (typeof progress.user == 'string') progressUser = progress.user;
	else progressUser = progress.user._id.toString();

	if (progressUser != user._id.toString())
		throw new UnauthorizedException(
			'you are not allowed to access this progress',
		);
}

export async function checkProgressAccess(
	user: UserDoc,
	progressId: string,
	ProgressModel: Model<Progress>,
	additionalFields = '',
): Promise<ProgressDoc> {
	const existingProgress = (await ProgressModel.findById(
		progressId,
		'user ' + additionalFields,
	)) as ProgressDoc;
	if (!existingProgress) throw new NotFoundException('Progress not found');

	// Will throw an exception if the user is not allowed to access this progress
	asProgressAccess(user, existingProgress);
	return existingProgress;
}
