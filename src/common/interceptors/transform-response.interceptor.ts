import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { map, Observable } from 'rxjs';
import { TRANSFORM_OPTIONS_KEY } from '../decorators/transform-response.decorator';

export interface PaginatedServiceResponse<TEntity = any> {
  data: TEntity[];
  total: number;
}

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const handler = context.getHandler(); // Gets a controller's method reference (Ex: FindAll)
    const transformOptions = this.reflector.get<{
      dto: ClassConstructor<any>;
      itemsKey: string;
    }>(TRANSFORM_OPTIONS_KEY, handler); // Reads the handler's reference metadata
    if (!transformOptions || !transformOptions.dto || !transformOptions.itemsKey) {
      return next.handle();
    }

    const { dto, itemsKey } = transformOptions;

    return next.handle().pipe(
      map((serviceResponse: PaginatedServiceResponse) => {
        if (
          typeof serviceResponse !== 'object' ||
          serviceResponse === null ||
          !('data' in serviceResponse) ||
          !('total' in serviceResponse) ||
          !Array.isArray(serviceResponse.data)
        ) {
          return serviceResponse; // Returns the response directly if does not comply with the format
        }
        const transformedData = plainToInstance(dto, serviceResponse.data, {
          excludeExtraneousValues: true,
        });

        const response = {
          total: serviceResponse.total,
        };
        response[itemsKey] = transformedData;

        return response;
      }),
    );
  }
}
