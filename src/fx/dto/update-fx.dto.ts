import { PartialType } from '@nestjs/mapped-types';
import { CreateFxDto } from './create-fx.dto';

export class UpdateFxDto extends PartialType(CreateFxDto) {}
