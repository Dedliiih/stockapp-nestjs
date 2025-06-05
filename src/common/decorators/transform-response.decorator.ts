import { SetMetadata } from '@nestjs/common';
import { ClassConstructor } from 'class-transformer';

/* Decorator to spicify the DTO and items key to transform a response */

export const TRANSFORM_OPTIONS_KEY = 'transform_options_metadata_key';

export const TransformResponse = (dto: ClassConstructor<any>, itemsKey: string) =>
  SetMetadata(TRANSFORM_OPTIONS_KEY, { dto, itemsKey });
