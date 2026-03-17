/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'selectValidator', async: false })
export class SelectValidator implements ValidatorConstraintInterface {
  validate(select: string, args: ValidationArguments) {
    // Extract the required fields and other options from the constraints
    const { validFields, separator } = args.constraints[0];

    if (!select) return true; // No validation needed if `select` is not provided

    // Split fields using `;` as a delimiter
    const fields = select.split(';');

    // Check if every field matches the valid fields
    return fields.every((field) => validFields.includes(field.trim()));
  }

  defaultMessage(args: ValidationArguments) {
    const { validFields, separator } = args.constraints[0];
    return `The select query must use only the following fields: [${validFields.join(
      ', ',
    )}] and be separated by ";".`;
  }
}
