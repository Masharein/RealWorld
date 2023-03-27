import {
  PipeTransform,
  ArgumentMetadata,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { ValidationError } from "class-validator";

export class BackendValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    const object = plainToClass(metadata.metatype, value);
    const errors = await validate(object);
    console.log(object, errors);

    if (errors.length === 0) {
      return value;
    }

    throw new HttpException(
      { errors: this.formatError(errors) },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
  private formatError(errors: ValidationError[]) {
    const result = {};
    
    errors.forEach((error) => {
      const property = error.property;
      const messages = Object.values(error.constraints);
      result[property] = messages;
    });
    
    return result;
  }
  
}
