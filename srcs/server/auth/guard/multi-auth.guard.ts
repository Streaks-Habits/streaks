import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class MultiAuthGuard extends AuthGuard(['jwt', 'api-key']) {}
