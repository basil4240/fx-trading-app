import {
  validateSync,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'validateIfNotEmpty', async: false })
export class ValidateIfNotEmptyConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    // Skip validation if value is null/undefined or empty object
    if (!value || Object.keys(value).length === 0) {
      return true;
    }
    // Validate using class-validator
    return validateSync(value).length === 0;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} contains invalid data`;
  }
}
