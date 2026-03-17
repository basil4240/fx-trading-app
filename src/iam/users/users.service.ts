import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GoneException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRegistrationDto } from './dto/user-registration.dto';
import { UserRegistrationResponse } from './responses/user-registration.response';
import { LoginDto } from '../dto/login.dto';
import { UserLoginResponse } from './responses/user-login.response';
import { DataResponse, MessageResponse } from 'src/common/responses';
import { VerifyEmailTokenDto } from './dto/verify-email-token.dto';
import { AuthenticationResponse } from '../responses/authentication.response';
import { PasswordResetRequestDto } from '../dto/password-reset-request.dto';
import { VerifyPasswordResetTokenDto } from '../dto/verify-password-reset-token.dto';
import { PasswordResetDto } from '../dto/password-reset.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { VerifyChangePasswordTokenDto } from './dto/verify-change-password-token.dto';
import { RequestNewTokenDto } from './dto/request-new-token.dto';
import { HelperService } from 'src/common/services/helper/helper.service';
import { HashingService } from 'src/common/services/hashing/hashing.service';
import { STATUS_CODES } from 'http';
import appConfig from 'src/common/config/app.config';
import type { ConfigType } from '@nestjs/config';
import { ActiveUserData } from 'src/common/interfaces/active-user-data.interface';
import { TokenTypeRequestPurpose } from './enums/token-type-request-purpose.enum';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { AccountStatus } from 'src/common/enums/account-status.enum';
import { Role } from 'src/common/enums/role.enum';
import { InvalidatedRefreshTokenException } from 'src/common/exceptions/invalidated-refresh-token.exception';
import { InjectRepository } from '@nestjs/typeorm';
import { IamUser } from '../entities/iam-user.entity';
import { DataSource, Repository } from 'typeorm';
import { PasswordHistory } from '../entities/password-history.entity';
import { EmailVerificationToken } from '../entities/email-verification-token.entity';
import { NotificationDispatcher } from 'src/notification/notification.dispatcher';
import { PasswordResetToken } from '../entities/password-reset-token.entity';
import { PasswordChangeToken } from '../entities/password-change-token.entity';
import { RefreshTokenStorageService } from 'src/common/services/refresh-token-storage.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly refreshTokenStorageService: RefreshTokenStorageService,
    private readonly helperService: HelperService,
    private readonly hashingService: HashingService,
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,

    private readonly dataSource: DataSource,

    @InjectRepository(IamUser)
    private readonly userRepo: Repository<IamUser>,

    @InjectRepository(PasswordHistory)
    private readonly passwordHistoryRepo: Repository<PasswordHistory>,

    @InjectRepository(PasswordChangeToken)
    private readonly passwordChangeTokenRepo: Repository<PasswordChangeToken>,

    @InjectRepository(PasswordResetToken)
    private readonly passwordResetTokenRepo: Repository<PasswordResetToken>,

    @InjectRepository(EmailVerificationToken)
    private readonly emailVerificationTokenRepo: Repository<EmailVerificationToken>,

    private readonly notificationDispatcher: NotificationDispatcher,
  ) {}

  async register(
    userRegistrationDto: UserRegistrationDto,
  ): Promise<DataResponse<UserRegistrationResponse>> {
    // check if user exists in iam
    const foundUser = await this.userRepo.findOne({
      where: {
        email: userRegistrationDto.email,
        role: Role.User,
      },
    });

    // if user exist and has not verify email
    if (foundUser && !foundUser.isEmailVerified) {
      throw new ForbiddenException({
        message:
          'User already exist, but has not verified their email. Please verify your email',
        statusCode: STATUS_CODES.FORBIDDEN,
        data: {
          userId: foundUser.id,
          email: foundUser.email,
        },
      });
    }

    // if user exist and has verify email
    if (foundUser && foundUser.isEmailVerified) {
      throw new ConflictException(
        'User already exist, please proceed to login',
      );
    }

    // hash the password
    const hashedPassword = await this.hashingService.hash(
      userRegistrationDto.password,
    );

    // create the user in iam and user profile
    const iamUser = await this.dataSource.transaction(async (manager) => {
      const user = manager.create(IamUser, {
        email: userRegistrationDto.email,
        passwordHash: hashedPassword,
        role: Role.User,
      });
      await manager.save(user);
      await manager.save(PasswordHistory, {
        iamUserId: user.id,
        passwordHash: hashedPassword,
      });

      return user;
    });

    // generate email verification token
    const otp = this.helperService.generateToken();

    // save the verification token in the db
    await this.emailVerificationTokenRepo.save({
      token: otp,
      iamUserId: iamUser.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 2),
    });

    // send email with the otp
    await this.notificationDispatcher.sendWelcomeEmail(iamUser.email, {
      fullname: userRegistrationDto.fullName,
      otp: otp,
    });

    return {
      message: 'User registration successful',
      data: {
        userId: iamUser.id,
        email: userRegistrationDto.email,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<DataResponse<UserLoginResponse>> {
    // check if user exists
    const foundUser = await this.userRepo.findOne({
      where: {
        email: loginDto.email,
        role: Role.User,
      },
    });

    // throw error if user does not exists
    if (!foundUser) {
      throw new NotFoundException('Invalid Credentials');
    }

    // check if user email is verified
    if (!foundUser.isEmailVerified) {
      throw new BadRequestException({
        message:
          'User already exist, but has not verified their email. Please verify your email now',
        statusCode: STATUS_CODES.BAD_REQUEST,
        data: {
          userId: foundUser.id,
          email: foundUser.email,
        },
      });
    }

    // compare and check if the passwords matches
    const isValidPassword = await this.hashingService.compare(
      loginDto.password,
      foundUser.passwordHash,
    );

    // check if password matches
    if (!isValidPassword) {
      throw new NotFoundException('Invalid Credentials');
    }

    // throw if account is suspended
    if (foundUser.accountStatus === AccountStatus.Suspended) {
      throw new UnauthorizedException(
        `User account suspended, contact support`,
      );
    }

    // throw if account is deleted
    if (foundUser.accountStatus === AccountStatus.Deleted) {
      throw new GoneException(
        `User account is in the process of beign deleted, contact support`,
      );
    }

    // token payload
    const tokenPayload: ActiveUserData = {
      sub: foundUser.id,
      email: foundUser.email,
      role: foundUser.role,
    };

    // generate access and refresh token
    const { accessToken, refreshToken } =
      await this.helperService.generateJwtTokens(tokenPayload);

    return {
      message: 'User login successful',
      data: {
        userId: foundUser.id,
        email: foundUser.email,
        accessToken,
        refreshToken,
      },
    };
  }

  async verifyEmailToken(
    verifyEmailTokenDto: VerifyEmailTokenDto,
  ): Promise<DataResponse<AuthenticationResponse>> {
    // check if user exists
    const foundUser = await this.userRepo.findOne({
      where: {
        email: verifyEmailTokenDto.email,
        role: Role.User,
      },
    });

    // throw error if user does not exists
    if (!foundUser) {
      throw new NotFoundException('Invalid Credentials');
    }

    // find that otp
    const emailVerificationToken =
      await this.emailVerificationTokenRepo.findOne({
        where: {
          token: verifyEmailTokenDto.token,
          iamUserId: foundUser.id,
          isUsed: false,
        },
      });

    // confirm if document exist
    if (!emailVerificationToken) {
      throw new BadRequestException('Invalid token provided');
    }

    // confirms if the otp has expires
    if (emailVerificationToken.expiresAt < new Date()) {
      await this.emailVerificationTokenRepo.update(
        { id: emailVerificationToken.id },
        { isUsed: true },
      );

      // throw an error
      throw new GoneException(
        'Otp has expired, please request for another one',
      );
    }

    await this.emailVerificationTokenRepo.update(
      { id: emailVerificationToken.id },
      { isUsed: true },
    );

    // update the user verification state
    await this.userRepo.update({ id: foundUser.id }, { isEmailVerified: true });

    // token payload
    const tokenPayload: ActiveUserData = {
      sub: foundUser.id,
      email: foundUser.email,
      role: foundUser.role,
    };

    // generate access and refresh token
    const { accessToken, refreshToken } =
      await this.helperService.generateJwtTokens(tokenPayload);

    return {
      message: 'Email verification successful',
      data: {
        userId: foundUser.id,
        email: foundUser.email,
        accessToken,
        refreshToken,
      },
    };
  }

  async passwordResetRequest(
    passwordResetRequestDto: PasswordResetRequestDto,
  ): Promise<MessageResponse> {
    // get the user
    const foundUser = await this.userRepo.findOne({
      where: {
        email: passwordResetRequestDto.email,
        role: Role.User,
      },
    });

    // if no user exist, throw an error
    if (!foundUser) {
      throw new BadRequestException('User not found');
    }

    await this.passwordResetTokenRepo.update(
      { iamUserId: foundUser.id },
      { isUsed: true },
    );

    // generate email verification token
    const otp = this.helperService.generateToken();

    // save the verification token in the db
    await this.passwordResetTokenRepo.save({
      token: otp,
      iamUserId: foundUser.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 2),
    });

    // send email with the otp
    await this.notificationDispatcher.sendPasswordResetEmail(foundUser.email, {
      otp: otp,
    });

    return {
      message:
        'An otp has been sent to your email address. Please check your email',
    };
  }

  async verifyPasswordResetToken(
    verifyPasswordResetTokenDto: VerifyPasswordResetTokenDto,
  ): Promise<MessageResponse> {
    // check if user exists
    const foundUser = await this.userRepo.findOne({
      where: {
        email: verifyPasswordResetTokenDto.email,
        role: Role.User,
      },
    });

    // throw error if user does not exists
    if (!foundUser) {
      throw new NotFoundException('Invalid Credentials');
    }

    // find that otp
    const passwordResetToken = await this.passwordResetTokenRepo.findOne({
      where: {
        token: verifyPasswordResetTokenDto.token,
        iamUserId: foundUser.id,
        isUsed: false,
      },
    });

    // confirm if document exist
    if (!passwordResetToken) {
      throw new BadRequestException('Invalid token provided');
    }

    // verify the otp
    if (passwordResetToken.expiresAt < new Date()) {
      await this.passwordResetTokenRepo.update(
        { id: passwordResetToken.id },
        { isUsed: true },
      );

      // throw an error
      throw new GoneException(
        'Otp has expired, please request for another one',
      );
    }

    // Update the otp to verified true
    await this.passwordResetTokenRepo.update(
      { id: passwordResetToken.id },
      { isUsed: true },
    );

    return {
      message: 'Password reset token is valid.',
    };
  }

  async passwordReset(
    passwordResetDto: PasswordResetDto,
  ): Promise<MessageResponse> {
    // check if user exists
    const foundUser = await this.userRepo.findOne({
      where: {
        email: passwordResetDto.email,
        role: Role.User,
      },
    });

    // throw error if user does not exists
    if (!foundUser) {
      throw new NotFoundException('Invalid Credentials');
    }

    // find that otp
    const passwordResetToken = await this.passwordResetTokenRepo.findOne({
      where: {
        iamUserId: foundUser.id,
        isUsed: false,
      },
    });

    // confirm if document exist
    if (!passwordResetToken) {
      throw new BadRequestException('Invalid token provided');
    }

    // check if the otp is valid
    if (!passwordResetToken.verified) {
      throw new BadRequestException('Otp has not been verified');
    }

    // hash the password
    const hashedPassword = await this.hashingService.hash(
      passwordResetDto.password,
    );

    // TODO: Make sure that the user does not have this new password in history

    // update the user password
    await this.userRepo.update(
      {
        id: foundUser.id,
      },
      {
        passwordHash: hashedPassword,
      },
    );

    // TODO: add password history

    await this.passwordResetTokenRepo.update(
      { id: passwordResetToken.id },
      { isUsed: true },
    );

    return {
      message: 'Password has been successfully reset.',
    };
  }

  async changePassword(
    activeUser: ActiveUserData,
    changePasswordDto: ChangePasswordDto,
  ): Promise<MessageResponse> {
    // get the user
    const user = await this.userRepo.findOne({
      where: {
        id: activeUser.sub,
      },
    });

    // check if user exists
    if (!user) {
      throw new NotFoundException('Invalid Credentials');
    }

    // compare and check if the passwords matches
    const isValidPassword = await this.hashingService.compare(
      changePasswordDto.oldPassword,
      user.passwordHash,
    );

    // check if password matches
    if (!isValidPassword) {
      throw new NotFoundException('Invalid Credentials');
    }

    // hash the new password
    const hashedPassword = await this.hashingService.hash(
      changePasswordDto.newPassword,
    );

    // generate email verification token
    const otp = this.helperService.generateToken();

    // save the verification token and password in the db
    await this.passwordChangeTokenRepo.save({
      token: otp,
      iamUserId: user.id,
      passwordHash: hashedPassword,
      expiresAt: new Date(Date.now() + 1000 * 60 * 2),
    });

    // send email with the otp
    await this.notificationDispatcher.sendPasswordResetEmail(user.email, {
      otp: otp,
    });

    return {
      message: 'An email containing verification token has been sent to you',
    };
  }

  async verifyChangePasswordToken(
    activeUser: ActiveUserData,
    verifyChangePasswordTokenDto: VerifyChangePasswordTokenDto,
  ): Promise<MessageResponse> {
    // check if user exists
    const foundUser = await this.userRepo.findOne({
      where: {
        email: verifyChangePasswordTokenDto.email,
        role: Role.User,
      },
    });

    // throw error if user does not exists
    if (!foundUser) {
      throw new NotFoundException('Invalid Credentials');
    }

    // find that otp
    const passwordChangeToken = await this.passwordChangeTokenRepo.findOne({
      where: {
        token: verifyChangePasswordTokenDto.token,
        iamUserId: foundUser.id,
        isUsed: false,
      },
    });

    // confirm if document exist
    if (!passwordChangeToken) {
      throw new BadRequestException('Invalid token provided');
    }

    // verify if the otp has expired
    if (passwordChangeToken.expiresAt < new Date()) {
      await this.passwordChangeTokenRepo.update(
        {
          id: passwordChangeToken.id,
        },
        {
          isUsed: true,
          passwordHash: '',
        },
      );

      // throw an error
      throw new GoneException(
        'Otp has expired, please go back and restart the process',
      );
    }

    // update the user password
    await this.userRepo.update(
      {
        id: passwordChangeToken.iamUserId,
      },
      {
        passwordHash: passwordChangeToken.passwordHash,
      },
    );
    // TODO: add password history

    await this.passwordChangeTokenRepo.update(
      {
        id: passwordChangeToken.id,
      },
      {
        isUsed: true,
        passwordHash: '',
      },
    );

    return {
      message: 'Your password has been changed successfully.',
    };
  }

  async requestNewToken(
    requestNewTokenDto: RequestNewTokenDto,
  ): Promise<MessageResponse> {
    // check if user exists
    const foundUser = await this.userRepo.findOne({
      where: {
        email: requestNewTokenDto.email,
        role: Role.User,
      },
    });

    // throw error if user does not exists
    if (!foundUser) {
      throw new NotFoundException('Invalid Credentials');
    }

    switch (requestNewTokenDto.purpose) {
      case TokenTypeRequestPurpose.PASSWORD_RESET:
        return this.requestPasswordResetToken(foundUser);
      case TokenTypeRequestPurpose.EMAIL_VERIFICATION:
        return this.requestEmailVerificationToken(foundUser);
      // case TokenTypeRequestPurpose.CHANGE_PASSWORD:
      //   return this.requestChangePasswordToken(foundUser);
      default:
        throw new BadRequestException('Invalid token purpose');
    }
  }

  private async requestPasswordResetToken(user: {
    id: string;
    email: string;
  }): Promise<MessageResponse> {
    await this.passwordResetTokenRepo.update(
      {
        iamUserId: user.id,
      },
      {
        isUsed: true,
      },
    );

    // generate email verification token
    const otp = this.helperService.generateToken();

    // save the verification token in the db
    await this.passwordResetTokenRepo.save({
      token: otp,
      iamUserId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 2),
    });

    // send email with the otp
    await this.notificationDispatcher.sendPasswordResetEmail(user.email, {
      otp: otp,
    });

    return {
      message: 'New token requested successfully.',
    };
  }

  private async requestEmailVerificationToken(user: {
    id: string;
    email: string;
  }): Promise<MessageResponse> {
    await this.emailVerificationTokenRepo.update(
      {
        iamUserId: user.id,
      },
      {
        isUsed: true,
      },
    );

    // generate email verification token
    const otp = this.helperService.generateToken();

    // save the verification token in the db
    await this.emailVerificationTokenRepo.save({
      token: otp,
      iamUserId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 2),
    });

    // send email with the otp
    await this.notificationDispatcher.sendPasswordResetEmail(user.email, {
      otp: otp,
    });

    return {
      message: 'New token requested successfully.',
    };
  }

  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<DataResponse<AuthenticationResponse>> {
    try {
      // verify the refresh token
      const { sub, refreshTokenId } =
        await this.helperService.verifyRefreshToken(
          refreshTokenDto.refreshToken,
        );

      // get the user
      const user = await this.userRepo.findOneBy({ id: sub });

      if (!user) {
        throw new NotFoundException('Invalid Credentials');
      }

      // check if the refreah token is valid (i.e. in the db)
      const isValid = await this.refreshTokenStorageService.validate(
        user.id,
        refreshTokenId ?? '',
      );

      if (isValid) {
        // invalidate the old token
        await this.refreshTokenStorageService.invalidate(user.id);
      } else {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // generate access and refresh token pair
      const { accessToken, refreshToken } =
        await this.helperService.generateJwtTokens({
          sub: user.id,
          email: user.email,
          role: user.role,
        });

      // return
      return {
        message: 'Token refreshed successfully.',
        data: {
          userId: user.id,
          email: user.email,
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      console.error('Refresh Token Error', error);
      if (error instanceof InvalidatedRefreshTokenException) {
        // TODO: Alert user of possible login compromised
        throw new UnauthorizedException('Access Denined');
      }

      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(activeUser: ActiveUserData): Promise<MessageResponse> {
    await this.refreshTokenStorageService.invalidate(activeUser.sub);

    return {
      message: 'Logged out successfully.',
    };
  }
}
