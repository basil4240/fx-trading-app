import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  getSchemaPath,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserRegistrationDto } from './dto/user-registration.dto';
import { UserRegistrationResponse } from './responses/user-registration.response';
import {
  DataExceptionResponse,
  DataResponse,
  ExceptionResponse,
  MessageResponse,
} from 'src/common/responses';
import { UserLoginResponse } from './responses/user-login.response';
import { VerifyEmailTokenDto } from './dto/verify-email-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { VerifyChangePasswordTokenDto } from './dto/verify-change-password-token.dto';
import { RequestNewTokenDto } from './dto/request-new-token.dto';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import type { ActiveUserData } from 'src/common/interfaces/active-user-data.interface';
import { AuthenticationResponse } from '../responses/authentication.response';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { AuthenticationGuard } from 'src/common/guards/authentication/authentication.guard';
import { PasswordResetRequestDto } from '../dto/password-reset-request.dto';
import { VerifyPasswordResetTokenDto } from '../dto/verify-password-reset-token.dto';
import { PasswordResetDto } from '../dto/password-reset.dto';

@ApiTags('IAM - Users')
@Controller('iam/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Registers a new user account with provided credentials and optional location data.
   * Upon successful registration, returns the newly created user's ID and email.
   *
   * @param userRegistrationDto The data transfer object containing user registration details.
   * @returns A DataResponse object containing the UserRegistrationResponse.
   */
  @Post('register')
  @ApiOperation({
    summary:
      'Register a new user account with email, password, and optional location.',
    description:
      "Registers a new user in the system. Upon successful registration, returns the newly created user's ID and email. Handles cases where the email already exists but is unverified (returns UnAuthenticationResponse) or is already verified (returns ExceptionResponse Conflict).",
  })
  @ApiCreatedResponse({
    description:
      "User successfully registered. Returns the user's ID and email.",
    schema: {
      allOf: [
        { $ref: getSchemaPath(DataResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(UserRegistrationResponse) },
          },
        },
      ],
    },
  })
  @ApiBadRequestResponse({
    description:
      'Bad Request. This can occur if the provided email is already registered but unverified. In this case, an UnAuthenticationResponse is returned, potentially including tokens to complete verification.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(DataExceptionResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(AuthenticationResponse) },
          },
        },
      ],
    },
  })
  @ApiConflictResponse({
    description:
      'Conflict. The provided email address is already registered and verified.',
    type: ExceptionResponse,
  })
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() userRegistrationDto: UserRegistrationDto,
  ): Promise<DataResponse<UserRegistrationResponse>> {
    return this.usersService.register(userRegistrationDto);
  }

  /**
   * Logs in a user with provided email and password.
   * Upon successful login, returns access and refresh tokens.
   *
   * @param loginDto The data transfer object containing user login credentials.|
   * @returns A DataResponse object containing the UserLoginResponse.
   */
  @Post('login')
  @ApiOperation({
    summary: 'Logs in a user with email and password.',
    description:
      'Authenticates a user using their email and password. Returns an access token and refresh token upon successful login. Handles cases of invalid credentials.',
  })
  @ApiOkResponse({
    description:
      'User successfully logged in. Returns access and refresh tokens.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(DataResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(UserLoginResponse) },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Invalid email or password.',
    type: ExceptionResponse,
  })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<DataResponse<UserLoginResponse>> {
    return this.usersService.login(loginDto);
  }

  /**
   * Generates a new access token using a refresh token.
   *
   * @param refreshTokenDto The data transfer object containing the refresh token.
   * @returns A DataResponse object containing the AuthenticationResponse with new tokens.
   */
  @Post('refresh-token')
  @ApiOperation({
    summary: 'Refresh access token.',
    description:
      'Generates a new access token for the user using a valid refresh token.',
  })
  @ApiOkResponse({
    description: 'Access token successfully refreshed.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(DataResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(AuthenticationResponse) },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Invalid or expired refresh token.',
    type: ExceptionResponse,
  })
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<DataResponse<AuthenticationResponse>> {
    return this.usersService.refreshToken(refreshTokenDto);
  }

  /**
   * Logs out the currently authenticated user.
   *
   * @param activeUser The data of the currently authenticated user.
   * @returns A MessageResponse indicating the success of the logout operation.
   */
  @Post('logout')
  @UseGuards(AuthenticationGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logs out the current user.',
    description:
      'Logs out the currently authenticated user, invalidating their session.',
  })
  @ApiOkResponse({
    description: 'User successfully logged out.',
    type: MessageResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. User not logged in.',
    type: ExceptionResponse,
  })
  @HttpCode(HttpStatus.OK)
  async logout(
    @ActiveUser() activeUser: ActiveUserData,
  ): Promise<MessageResponse> {
    return this.usersService.logout(activeUser);
  }

  /**
   * Verifies a user's email address using a token received via email.
   *
   * @param verifyEmailTokenDto The data transfer object containing the user ID, email, and verification token.
   * @returns A DataResponse object containing the AuthenticationResponse.
   */
  @Post('verify-email')
  @ApiOperation({
    summary: 'Verify user email with token.',
    description:
      "Verifies a user's email address using a token received via email. Upon successful verification, returns user ID and email, potentially with authentication tokens if applicable.",
  })
  @ApiOkResponse({
    description: 'Email successfully verified. Returns authentication details.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(DataResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(AuthenticationResponse) },
          },
        },
      ],
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad Request. Invalid token or other validation issues.',
    type: ExceptionResponse,
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized. User not found, token expired, or invalid token.',
    type: ExceptionResponse,
  })
  @HttpCode(HttpStatus.OK)
  async verifyEmailToken(
    @Body() verifyEmailTokenDto: VerifyEmailTokenDto,
  ): Promise<DataResponse<AuthenticationResponse>> {
    return this.usersService.verifyEmailToken(verifyEmailTokenDto);
  }

  /**
   * Initiates the password reset process by sending a password reset token to the user's registered email address.
   *
   * @param passwordResetRequestDto The data transfer object containing the email for which to request a password reset.
   * @returns A MessageResponse indicating the status of the request.
   */
  @Post('password-reset-request')
  @ApiOperation({
    summary: 'Request a password reset for a user.',
    description:
      "Initiates the password reset process by sending a password reset token to the user's registered email address.",
  })
  @ApiOkResponse({
    description: 'Password reset email sent successfully.',
    type: MessageResponse,
  })
  @ApiBadRequestResponse({
    description:
      'Bad Request. Invalid email address or other validation issues.',
    type: ExceptionResponse,
  })
  @HttpCode(HttpStatus.OK)
  async passwordResetRequest(
    @Body() passwordResetRequestDto: PasswordResetRequestDto,
  ): Promise<MessageResponse> {
    return this.usersService.passwordResetRequest(passwordResetRequestDto);
  }

  /**
   * Verifies the validity of a password reset token provided for a user's email address.
   *
   * @param verifyPasswordResetTokenDto The data transfer object containing the email and the password reset token.
   * @returns A MessageResponse indicating the status of the token verification.
   */
  @Post('verify-password-reset-token')
  @ApiOperation({
    summary: 'Verify password reset token for a user.',
    description:
      "Verifies the validity of a password reset token provided for a user's email address. A successful verification indicates the token is valid and the user can proceed to reset their password.",
  })
  @ApiOkResponse({
    description: 'Password reset token is valid.',
    type: MessageResponse,
  })
  @ApiBadRequestResponse({
    description:
      'Bad Request. Invalid email, invalid token, or other validation issues.',
    type: ExceptionResponse,
  })
  @HttpCode(HttpStatus.OK)
  async verifyPasswordResetToken(
    @Body() verifyPasswordResetTokenDto: VerifyPasswordResetTokenDto,
  ): Promise<MessageResponse> {
    return this.usersService.verifyPasswordResetToken(
      verifyPasswordResetTokenDto,
    );
  }

  /**
   * Resets the user's password after successful verification of the password reset token.
   *
   * @param passwordResetDto The data transfer object containing the user's email and new password.
   * @returns A MessageResponse indicating the success of the password reset.
   */
  @Post('password-reset')
  @ApiOperation({
    summary: 'Reset user password.',
    description:
      "Resets the user's password after successful verification of the password reset token. Requires the user's email and the new password.",
  })
  @ApiOkResponse({
    description: 'Password successfully reset.',
    type: MessageResponse,
  })
  @ApiBadRequestResponse({
    description:
      'Bad Request. Invalid password, email, or other validation issues.',
    type: ExceptionResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Password reset token not verified or expired.',
    type: ExceptionResponse,
  })
  @HttpCode(HttpStatus.OK)
  async passwordReset(
    @Body() passwordResetDto: PasswordResetDto,
  ): Promise<MessageResponse> {
    return this.usersService.passwordReset(passwordResetDto);
  }

  /**
   * Changes the password for the currently authenticated user.
   *
   * @param userId The ID of the currently authenticated user.
   * @param changePasswordDto The data transfer object containing the old and new passwords.
   * @returns A MessageResponse indicating the success of the password change.
   */
  @Post('change-password')
  @UseGuards(AuthenticationGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Change user password.',
    description:
      'Changes the password for the currently authenticated user. Requires the user to be logged in.',
  })
  @ApiOkResponse({
    description: 'Password successfully changed.',
    type: MessageResponse,
  })
  @ApiBadRequestResponse({
    description:
      'Bad Request. Invalid old password, new password does not meet requirements, or other validation issues.',
    type: ExceptionResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. User not logged in.',
    type: ExceptionResponse,
  })
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @ActiveUser() activeUser: ActiveUserData,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<MessageResponse> {
    return this.usersService.changePassword(activeUser, changePasswordDto);
  }

  /**
   * Verifies the validity of a change password token.
   *
   * @param verifyChangePasswordTokenDto The data transfer object containing the email, user ID, and token.
   * @returns A MessageResponse indicating the status of the token verification.
   */
  @Post('verify-change-password-token')
  @UseGuards(AuthenticationGuard)
  @ApiOperation({
    summary: 'Verify change password token.',
    description:
      'Verifies the validity of a token provided for a change password request. A successful verification indicates the token is valid.',
  })
  @ApiOkResponse({
    description: 'Change password token is valid.',
    type: MessageResponse,
  })
  @ApiBadRequestResponse({
    description:
      'Bad Request. Invalid email, user ID, token, or other validation issues.',
    type: ExceptionResponse,
  })
  @HttpCode(HttpStatus.OK)
  async verifyChangePasswordToken(
    @Body() verifyChangePasswordTokenDto: VerifyChangePasswordTokenDto,
    @ActiveUser() activeUser: ActiveUserData,
  ): Promise<MessageResponse> {
    return this.usersService.verifyChangePasswordToken(
      activeUser,
      verifyChangePasswordTokenDto,
    );
  }

  /**
   * Requests a new token (OTP) for various purposes like password reset, email verification, or change password.
   *
   * @param requestNewTokenDto The data transfer object containing the email and the purpose for the new token request.
   * @returns A MessageResponse indicating the status of the token request.
   */
  @Post('request-new-token')
  @ApiOperation({
    summary: 'Request a new token.',
    description:
      'Requests a new token (OTP) for purposes such as password reset, email verification, or change password. This is used when the initial token has expired or was not received.',
  })
  @ApiOkResponse({
    description: 'New token requested successfully.',
    type: MessageResponse,
  })
  @ApiBadRequestResponse({
    description:
      'Bad Request. Invalid email, purpose, or other validation issues.',
    type: ExceptionResponse,
  })
  @HttpCode(HttpStatus.OK)
  async requestNewToken(
    @Body() requestNewTokenDto: RequestNewTokenDto,
  ): Promise<MessageResponse> {
    return this.usersService.requestNewToken(requestNewTokenDto);
  }
}
