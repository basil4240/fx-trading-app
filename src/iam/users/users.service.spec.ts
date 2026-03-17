import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import { HashingService } from 'src/common/services/hashing/hashing.service';
import { EmailService } from 'src/common/services/email/email.service';
import appConfig from 'src/common/config/app.config';
import { HelperService } from 'src/common/services/helper/helper.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockPrismaService = {
    iamUser: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    emailVerificationToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    passwordResetToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    passwordChangeToken: {
      updateMany: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockHashingService = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  const mockEmailService = {
    sendEmail: jest.fn(),
  };

  const mockAppConfig = {
    supportEmail: 'test@example.com',
  };

  const mockHelperService = {
    generateToken: jest.fn(),
    generateJwtTokens: jest.fn().mockResolvedValue({
      accessToken: 'mockAccessToken',
      refreshToken: 'mockRefreshToken',
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: HashingService,
          useValue: mockHashingService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: appConfig.KEY,
          useValue: mockAppConfig,
        },
        {
          provide: HelperService,
          useValue: mockHelperService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

    it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const userRegistrationDto = {
      email: 'test@example.com',
      password: 'Password123!',
      fullName: 'Test User',
      location: {
        latitude: 10,
        longitude: 20,
        addressLine1: '123 Main St',
        addressLine2: '',
        city: 'Test City',
        state: 'Test State',
        country: 'Test Country',
        postalCode: '12345',
        googlePlaceId: 'abc',
        name: 'Test Location',
      },
    };

    it('should successfully register a new user', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce(null);
      mockHashingService.hash.mockResolvedValueOnce('hashedPassword');
      mockPrismaService.iamUser.create.mockResolvedValueOnce({
        id: 'userId1',
        email: userRegistrationDto.email,
        role: 'USER',
        userProfile: {
          fullName: userRegistrationDto.fullName,
        },
      });
      mockHelperService.generateToken.mockReturnValueOnce('mockOtp');
      mockPrismaService.emailVerificationToken.create.mockResolvedValueOnce({});
      mockEmailService.sendEmail.mockResolvedValueOnce(true);

      const result = await service.register(userRegistrationDto);

      expect(mockPrismaService.iamUser.findUnique).toHaveBeenCalledWith({
        where: {
          email_role: {
            email: userRegistrationDto.email,
            role: 'USER',
          },
        },
      });
      expect(mockHashingService.hash).toHaveBeenCalledWith(userRegistrationDto.password);
      expect(mockPrismaService.iamUser.create).toHaveBeenCalledWith({
        data: {
          email: userRegistrationDto.email,
          passwordHash: 'hashedPassword',
          role: 'USER',
          passwordHistory: {
            create: {
              passwordHash: 'hashedPassword',
            },
          },
          userProfile: {
            create: {
              fullName: userRegistrationDto.fullName,
              currentLocation: {
                create: {
                  latitude: userRegistrationDto.location.latitude,
                  longitude: userRegistrationDto.location.longitude,
                  addressLine1: userRegistrationDto.location.addressLine1,
                  addressLine2: userRegistrationDto.location.addressLine2,
                  city: userRegistrationDto.location.city,
                  state: userRegistrationDto.location.state,
                  country: userRegistrationDto.location.country,
                  postalCode: userRegistrationDto.location.postalCode,
                  googlePlaceId: userRegistrationDto.location.googlePlaceId,
                  name: userRegistrationDto.location.name,
                },
              },
            },
          },
        },
      });
      expect(mockHelperService.generateToken).toHaveBeenCalled();
      expect(mockPrismaService.emailVerificationToken.create).toHaveBeenCalled();
      expect(mockEmailService.sendEmail).toHaveBeenCalled();
      expect(result.message).toBe('User registration successful');
      expect(result.data.email).toBe(userRegistrationDto.email);
    });

    it('should throw BadRequestException if user already exists but email is not verified', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce({
        id: 'userId1',
        email: userRegistrationDto.email,
        isEmailVerified: false,
      });

      await expect(service.register(userRegistrationDto)).rejects.toThrow(
        'User already exist, but has not verified their email. Please verify your email',
      );
    });

    it('should throw ConflictException if user already exists and email is verified', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce({
        id: 'userId1',
        email: userRegistrationDto.email,
        isEmailVerified: true,
      });

      await expect(service.register(userRegistrationDto)).rejects.toThrow(
        'User already exist',
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    const foundUser = {
      id: 'userId1',
      email: loginDto.email,
      passwordHash: 'hashedPassword',
      isEmailVerified: true,
      accountStatus: 'ACTIVE',
      role: 'USER',
    };

    it('should successfully log in a user and return tokens', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce(foundUser);
      mockHashingService.compare.mockResolvedValueOnce(true);
      mockHelperService.generateJwtTokens.mockResolvedValueOnce({
        accessToken: 'mockAccessToken',
        refreshToken: 'mockRefreshToken',
      });

      const result = await service.login(loginDto);

      expect(mockPrismaService.iamUser.findUnique).toHaveBeenCalledWith({
        where: {
          email_role: {
            email: loginDto.email,
            role: 'USER',
          },
        },
      });
      expect(mockHashingService.compare).toHaveBeenCalledWith(
        loginDto.password,
        foundUser.passwordHash,
      );
      expect(mockHelperService.generateJwtTokens).toHaveBeenCalledWith({
        sub: foundUser.id,
        email: foundUser.email,
        role: foundUser.role,
      });
      expect(result.message).toBe('User login successful');
      expect(result.data.accessToken).toBe('mockAccessToken');
      expect(result.data.refreshToken).toBe('mockRefreshToken');
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce(null);

      await expect(service.login(loginDto)).rejects.toThrow('User Does not Exist');
    });

    it('should throw BadRequestException if email is not verified', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce({
        ...foundUser,
        isEmailVerified: false,
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        'User already exist, but has not verified their email. Please verify your email now',
      );
    });

    it('should throw NotFoundException if password does not match', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce(foundUser);
      mockHashingService.compare.mockResolvedValueOnce(false);

      await expect(service.login(loginDto)).rejects.toThrow('User Does not Exist');
    });

    it('should throw UnauthorizedException if account is suspended', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce({
        ...foundUser,
        accountStatus: 'SUSPENDED',
      });
      mockHashingService.compare.mockResolvedValueOnce(true);

      await expect(service.login(loginDto)).rejects.toThrow(
        `User account suspended, contact support ${mockAppConfig.supportEmail}`,
      );
    });

    it('should throw GoneException if account is deleted', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce({
        ...foundUser,
        accountStatus: 'DELETED',
      });
      mockHashingService.compare.mockResolvedValueOnce(true);

      await expect(service.login(loginDto)).rejects.toThrow(
        `User account is in the process of beign deleted, contact support ${mockAppConfig.supportEmail}`,
      );
    });
  });

  describe('verifyEmailToken', () => {
    const verifyEmailTokenDto = {
      userId: 'userId1',
      email: 'test@example.com',
      token: 'validOtp',
    };

    const foundUser = {
      id: 'userId1',
      email: verifyEmailTokenDto.email,
      role: 'USER',
    };

    it('should successfully verify email token', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce(foundUser);
      mockPrismaService.emailVerificationToken.findFirst.mockResolvedValueOnce({
        id: 'tokenId1',
        token: verifyEmailTokenDto.token,
        iamUserId: verifyEmailTokenDto.userId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 5), // 5 minutes in future
        isUsed: false,
      });
      mockPrismaService.emailVerificationToken.update.mockResolvedValueOnce({});
      mockPrismaService.iamUser.update.mockResolvedValueOnce({
        ...foundUser,
        isEmailVerified: true,
      });
      mockHelperService.generateJwtTokens.mockResolvedValueOnce({
        accessToken: 'mockAccessToken',
        refreshToken: 'mockRefreshToken',
      });

      const result = await service.verifyEmailToken(verifyEmailTokenDto);

      expect(mockPrismaService.iamUser.findUnique).toHaveBeenCalledWith({
        where: {
          email_role: {
            email: verifyEmailTokenDto.email,
            role: 'USER',
          },
        },
      });
      expect(mockPrismaService.emailVerificationToken.findFirst).toHaveBeenCalledWith({
        where: {
          token: verifyEmailTokenDto.token,
          iamUserId: verifyEmailTokenDto.userId,
          isUsed: false,
        },
      });
      expect(mockPrismaService.emailVerificationToken.update).toHaveBeenCalledWith({
        where: { id: 'tokenId1' },
        data: { isUsed: true },
      });
      expect(mockPrismaService.iamUser.update).toHaveBeenCalledWith({
        where: { id: verifyEmailTokenDto.userId },
        data: { isEmailVerified: true },
      });
      expect(mockHelperService.generateJwtTokens).toHaveBeenCalledWith({
        sub: foundUser.id,
        email: foundUser.email,
        role: foundUser.role,
      });
      expect(result.message).toBe('Email verification successful');
      expect(result.data.accessToken).toBe('mockAccessToken');
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce(null);

      await expect(service.verifyEmailToken(verifyEmailTokenDto)).rejects.toThrow('User Does not Exist');
    });

    it('should throw BadRequestException if token is invalid', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce(foundUser);
      mockPrismaService.emailVerificationToken.findFirst.mockResolvedValueOnce(null);

      await expect(service.verifyEmailToken(verifyEmailTokenDto)).rejects.toThrow('Invalid token provided');
    });

    it('should throw GoneException if token has expired', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce(foundUser);
      mockPrismaService.emailVerificationToken.findFirst.mockResolvedValueOnce({
        id: 'tokenId1',
        token: verifyEmailTokenDto.token,
        iamUserId: verifyEmailTokenDto.userId,
        expiresAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes in past
        isUsed: false,
      });
      mockPrismaService.emailVerificationToken.update.mockResolvedValueOnce({});

      await expect(service.verifyEmailToken(verifyEmailTokenDto)).rejects.toThrow('Otp has expired, please request for another one');
    });
  });

  describe('passwordResetRequest', () => {
    const passwordResetRequestDto = {
      email: 'test@example.com',
    };

    const foundUser = {
      id: 'userId1',
      email: passwordResetRequestDto.email,
    };

    it('should successfully request a password reset token', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce(foundUser);
      mockPrismaService.passwordResetToken.updateMany.mockResolvedValueOnce({});
      mockHelperService.generateToken.mockReturnValueOnce('mockOtp');
      mockPrismaService.passwordResetToken.create.mockResolvedValueOnce({});
      mockEmailService.sendEmail.mockResolvedValueOnce(true);

      const result = await service.passwordResetRequest(passwordResetRequestDto);

      expect(mockPrismaService.iamUser.findUnique).toHaveBeenCalledWith({
        where: {
          email: passwordResetRequestDto.email,
        },
      });
      expect(mockPrismaService.passwordResetToken.updateMany).toHaveBeenCalledWith({
        where: {
          iamUserId: foundUser.id,
        },
        data: {
          isUsed: true,
        },
      });
      expect(mockHelperService.generateToken).toHaveBeenCalled();
      expect(mockPrismaService.passwordResetToken.create).toHaveBeenCalled();
      expect(mockEmailService.sendEmail).toHaveBeenCalled();
      expect(result.message).toBe('An otp has been sent to your email address. Please check your email');
    });

    it('should throw BadRequestException if user does not exist', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce(null);

      await expect(service.passwordResetRequest(passwordResetRequestDto)).rejects.toThrow('User not found');
    });
  });

  describe('verifyPasswordResetToken', () => {
    const verifyPasswordResetTokenDto = {
      email: 'test@example.com',
      token: 'validResetOtp',
    };

    const foundUser = {
      id: 'userId1',
      email: verifyPasswordResetTokenDto.email,
      role: 'USER',
    };

    it('should successfully verify password reset token', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce(foundUser);
      mockPrismaService.passwordResetToken.findFirst.mockResolvedValueOnce({
        id: 'resetTokenId1',
        token: verifyPasswordResetTokenDto.token,
        iamUserId: foundUser.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 5), // 5 minutes in future
        isUsed: false,
        verified: false,
      });
      mockPrismaService.passwordResetToken.update.mockResolvedValueOnce({});

      const result = await service.verifyPasswordResetToken(verifyPasswordResetTokenDto);

      expect(mockPrismaService.iamUser.findUnique).toHaveBeenCalledWith({
        where: {
          email_role: {
            email: verifyPasswordResetTokenDto.email,
            role: 'USER',
          },
        },
      });
      expect(mockPrismaService.passwordResetToken.findFirst).toHaveBeenCalledWith({
        where: {
          token: verifyPasswordResetTokenDto.token,
          iamUserId: foundUser.id,
          isUsed: false,
        },
      });
      expect(mockPrismaService.passwordResetToken.update).toHaveBeenCalledWith({
        where: { id: 'resetTokenId1' },
        data: { verified: true },
      });
      expect(result.message).toBe('Password reset token is valid.');
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce(null);

      await expect(service.verifyPasswordResetToken(verifyPasswordResetTokenDto)).rejects.toThrow('User Does not Exist');
    });

    it('should throw BadRequestException if token is invalid', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce(foundUser);
      mockPrismaService.passwordResetToken.findFirst.mockResolvedValueOnce(null);

      await expect(service.verifyPasswordResetToken(verifyPasswordResetTokenDto)).rejects.toThrow('Invalid token provided');
    });

    it('should throw GoneException if token has expired', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce(foundUser);
      mockPrismaService.passwordResetToken.findFirst.mockResolvedValueOnce({
        id: 'resetTokenId1',
        token: verifyPasswordResetTokenDto.token,
        iamUserId: foundUser.id,
        expiresAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes in past
        isUsed: false,
        verified: false,
      });
      mockPrismaService.passwordResetToken.update.mockResolvedValueOnce({});

      await expect(service.verifyPasswordResetToken(verifyPasswordResetTokenDto)).rejects.toThrow('Otp has expired, please request for another one');
    });
  });

  describe('passwordReset', () => {
    const passwordResetDto = {
      email: 'test@example.com',
      password: 'NewPassword123!',
    };

    const foundUser = {
      id: 'userId1',
      email: passwordResetDto.email,
      role: 'USER',
    };

    it('should successfully reset user password', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce(foundUser);
      mockPrismaService.passwordResetToken.findFirst.mockResolvedValueOnce({
        id: 'resetTokenId1',
        iamUserId: foundUser.id,
        isUsed: false,
        verified: true,
      });
      mockHashingService.hash.mockResolvedValueOnce('hashedNewPassword');
      mockPrismaService.iamUser.update.mockResolvedValueOnce({});
      mockPrismaService.passwordResetToken.update.mockResolvedValueOnce({});

      const result = await service.passwordReset(passwordResetDto);

      expect(mockPrismaService.iamUser.findUnique).toHaveBeenCalledWith({
        where: {
          email_role: {
            email: passwordResetDto.email,
            role: 'USER',
          },
        },
      });
      expect(mockPrismaService.passwordResetToken.findFirst).toHaveBeenCalledWith({
        where: {
          iamUserId: foundUser.id,
          isUsed: false,
        },
      });
      expect(mockHashingService.hash).toHaveBeenCalledWith(passwordResetDto.password);
      expect(mockPrismaService.iamUser.update).toHaveBeenCalledWith({
        where: { id: foundUser.id },
        data: {
          passwordHash: 'hashedNewPassword',
          passwordHistory: {
            create: {
              passwordHash: 'hashedNewPassword',
            },
          },
        },
      });
      expect(mockPrismaService.passwordResetToken.update).toHaveBeenCalledWith({
        where: { id: 'resetTokenId1' },
        data: { isUsed: true },
      });
      expect(result.message).toBe('Password has been successfully reset.');
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce(null);

      await expect(service.passwordReset(passwordResetDto)).rejects.toThrow('User Does not Exist');
    });

    it('should throw BadRequestException if token is invalid', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce(foundUser);
      mockPrismaService.passwordResetToken.findFirst.mockResolvedValueOnce(null);

      await expect(service.passwordReset(passwordResetDto)).rejects.toThrow('Invalid token provided');
    });

    it('should throw BadRequestException if token is not verified', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce(foundUser);
      mockPrismaService.passwordResetToken.findFirst.mockResolvedValueOnce({
        id: 'resetTokenId1',
        iamUserId: foundUser.id,
        isUsed: false,
        verified: false,
      });

      await expect(service.passwordReset(passwordResetDto)).rejects.toThrow('Otp has not been verified');
    });
  });

  describe('requestNewToken', () => {
    const requestNewTokenDto = {
      email: 'test@example.com',
      purpose: 'PASSWORD_RESET',
    };

    const foundUser = {
      id: 'userId1',
      email: requestNewTokenDto.email,
      role: 'USER',
    };

    it('should successfully request a new password reset token', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce(foundUser);
      mockPrismaService.passwordResetToken.updateMany.mockResolvedValueOnce({});
      mockHelperService.generateToken.mockReturnValueOnce('mockOtp');
      mockPrismaService.passwordResetToken.create.mockResolvedValueOnce({});
      mockEmailService.sendEmail.mockResolvedValueOnce(true);

      const result = await service.requestNewToken({
        ...requestNewTokenDto,
        purpose: 'PASSWORD_RESET',
      });

      expect(mockPrismaService.iamUser.findUnique).toHaveBeenCalledWith({
        where: {
          email_role: {
            email: requestNewTokenDto.email,
            role: 'USER',
          },
        },
      });
      expect(mockPrismaService.passwordResetToken.updateMany).toHaveBeenCalledWith({
        where: {
          iamUserId: foundUser.id,
        },
        data: {
          isUsed: true,
        },
      });
      expect(mockHelperService.generateToken).toHaveBeenCalled();
      expect(mockPrismaService.passwordResetToken.create).toHaveBeenCalled();
      expect(mockEmailService.sendEmail).toHaveBeenCalled();
      expect(result.message).toBe('New token requested successfully.');
    });

    it('should successfully request a new email verification token', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce(foundUser);
      mockPrismaService.emailVerificationToken.updateMany.mockResolvedValueOnce({});
      mockHelperService.generateToken.mockReturnValueOnce('mockOtp');
      mockPrismaService.emailVerificationToken.create.mockResolvedValueOnce({});
      mockEmailService.sendEmail.mockResolvedValueOnce(true);

      const result = await service.requestNewToken({
        ...requestNewTokenDto,
        purpose: 'EMAIL_VERIFICATION',
      });

      expect(mockPrismaService.iamUser.findUnique).toHaveBeenCalledWith({
        where: {
          email_role: {
            email: requestNewTokenDto.email,
            role: 'USER',
          },
        },
      });
      expect(mockPrismaService.emailVerificationToken.updateMany).toHaveBeenCalledWith({
        where: {
          iamUserId: foundUser.id,
        },
        data: {
          isUsed: true,
        },
      });
      expect(mockHelperService.generateToken).toHaveBeenCalled();
      expect(mockPrismaService.emailVerificationToken.create).toHaveBeenCalled();
      expect(mockEmailService.sendEmail).toHaveBeenCalled();
      expect(result.message).toBe('New token requested successfully.');
    });

    it('should successfully request a new change password token', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce(foundUser);
      mockPrismaService.passwordChangeToken.updateMany.mockResolvedValueOnce({});
      mockHelperService.generateToken.mockReturnValueOnce('mockOtp');
      mockPrismaService.passwordChangeToken.create.mockResolvedValueOnce({});
      mockEmailService.sendEmail.mockResolvedValueOnce(true);

      const result = await service.requestNewToken({
        ...requestNewTokenDto,
        purpose: 'CHANGE_PASSWORD',
      });

      expect(mockPrismaService.iamUser.findUnique).toHaveBeenCalledWith({
        where: {
          email_role: {
            email: requestNewTokenDto.email,
            role: 'USER',
          },
        },
      });
      expect(mockPrismaService.passwordChangeToken.updateMany).toHaveBeenCalledWith({
        where: {
          iamUserId: foundUser.id,
        },
        data: {
          isUsed: true,
        },
      });
      expect(mockHelperService.generateToken).toHaveBeenCalled();
      expect(mockPrismaService.passwordChangeToken.create).toHaveBeenCalled();
      expect(mockEmailService.sendEmail).toHaveBeenCalled();
      expect(result.message).toBe('New token requested successfully.');
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce(null);

      await expect(service.requestNewToken(requestNewTokenDto)).rejects.toThrow('User Does not Exist');
    });

    it('should throw BadRequestException if purpose is invalid', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce(foundUser);

      await expect(service.requestNewToken({
        ...requestNewTokenDto,
        purpose: 'INVALID_PURPOSE' as any, // Cast to any to bypass type checking
      })).rejects.toThrow('Invalid token purpose');
    });
  });

  describe('changePassword', () => {
    const userId = 'someUserId';
    const changePasswordDto = {
      oldPassword: 'OldPassword123!',
      newPassword: 'NewPassword123!',
    };

    it('should return success message (placeholder)', async () => {
      // Since this is a placeholder in the service, we only expect it to return the message
      const result = await service.changePassword(userId, changePasswordDto);
      expect(result.message).toBe('Password changed successfully');
    });
  });

  describe('verifyChangePasswordToken', () => {
    const verifyChangePasswordTokenDto = {
      userId: 'someUserId',
      token: 'someToken',
    };

    it('should return success message (placeholder)', async () => {
      // Since this is a placeholder in the service, we only expect it to return the message
      const result = await service.verifyChangePasswordToken(verifyChangePasswordTokenDto);
      expect(result.message).toBe('Change password token verified successfully.');
    });
  });

  describe('verifyPasswordResetToken', () => {
    const verifyPasswordResetTokenDto = {
      email: 'test@example.com',
      token: 'validResetOtp',
    };

    const foundUser = {
      id: 'userId1',
      email: verifyPasswordResetTokenDto.email,
      role: 'USER',
    };

    it('should successfully verify password reset token', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce(foundUser);
      mockPrismaService.passwordResetToken.findFirst.mockResolvedValueOnce({
        id: 'resetTokenId1',
        token: verifyPasswordResetTokenDto.token,
        iamUserId: foundUser.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 5), // 5 minutes in future
        isUsed: false,
        verified: false,
      });
      mockPrismaService.passwordResetToken.update.mockResolvedValueOnce({});

      const result = await service.verifyPasswordResetToken(verifyPasswordResetTokenDto);

      expect(mockPrismaService.iamUser.findUnique).toHaveBeenCalledWith({
        where: {
          email_role: {
            email: verifyPasswordResetTokenDto.email,
            role: 'USER',
          },
        },
      });
      expect(mockPrismaService.passwordResetToken.findFirst).toHaveBeenCalledWith({
        where: {
          token: verifyPasswordResetTokenDto.token,
          iamUserId: foundUser.id,
          isUsed: false,
        },
      });
      expect(mockPrismaService.passwordResetToken.update).toHaveBeenCalledWith({
        where: { id: 'resetTokenId1' },
        data: { verified: true },
      });
      expect(result.message).toBe('Password reset token is valid.');
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce(null);

      await expect(service.verifyPasswordResetToken(verifyPasswordResetTokenDto)).rejects.toThrow('User Does not Exist');
    });

    it('should throw BadRequestException if token is invalid', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce(foundUser);
      mockPrismaService.passwordResetToken.findFirst.mockResolvedValueOnce(null);

      await expect(service.verifyPasswordResetToken(verifyPasswordResetTokenDto)).rejects.toThrow('Invalid token provided');
    });

    it('should throw GoneException if token has expired', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce(foundUser);
      mockPrismaService.passwordResetToken.findFirst.mockResolvedValueOnce({
        id: 'resetTokenId1',
        token: verifyPasswordResetTokenDto.token,
        iamUserId: foundUser.id,
        expiresAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes in past
        isUsed: false,
        verified: false,
      });
      mockPrismaService.passwordResetToken.update.mockResolvedValueOnce({});

      await expect(service.verifyPasswordResetToken(verifyPasswordResetTokenDto)).rejects.toThrow('Otp has expired, please request for another one');
    });
  });

  describe('verifyEmailToken', () => {
    const verifyEmailTokenDto = {
      userId: 'userId1',
      email: 'test@example.com',
      token: 'validOtp',
    };

    const foundUser = {
      id: 'userId1',
      email: verifyEmailTokenDto.email,
      role: 'USER',
    };

    it('should successfully verify email token', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce(foundUser);
      mockPrismaService.emailVerificationToken.findFirst.mockResolvedValueOnce({
        id: 'tokenId1',
        token: verifyEmailTokenDto.token,
        iamUserId: verifyEmailTokenDto.userId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 5), // 5 minutes in future
        isUsed: false,
      });
      mockPrismaService.emailVerificationToken.update.mockResolvedValueOnce({});
      mockPrismaService.iamUser.update.mockResolvedValueOnce({
        ...foundUser,
        isEmailVerified: true,
      });
      mockHelperService.generateJwtTokens.mockResolvedValueOnce({
        accessToken: 'mockAccessToken',
        refreshToken: 'mockRefreshToken',
      });

      const result = await service.verifyEmailToken(verifyEmailTokenDto);

      expect(mockPrismaService.iamUser.findUnique).toHaveBeenCalledWith({
        where: {
          email_role: {
            email: verifyEmailTokenDto.email,
            role: 'USER',
          },
        },
      });
      expect(mockPrismaService.emailVerificationToken.findFirst).toHaveBeenCalledWith({
        where: {
          token: verifyEmailTokenDto.token,
          iamUserId: verifyEmailTokenDto.userId,
          isUsed: false,
        },
      });
      expect(mockPrismaService.emailVerificationToken.update).toHaveBeenCalledWith({
        where: { id: 'tokenId1' },
        data: { isUsed: true },
      });
      expect(mockPrismaService.iamUser.update).toHaveBeenCalledWith({
        where: { id: verifyEmailTokenDto.userId },
        data: { isEmailVerified: true },
      });
      expect(mockHelperService.generateJwtTokens).toHaveBeenCalledWith({
        sub: foundUser.id,
        email: foundUser.email,
        role: foundUser.role,
      });
      expect(result.message).toBe('Email verification successful');
      expect(result.data.accessToken).toBe('mockAccessToken');
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce(null);

      await expect(service.verifyEmailToken(verifyEmailTokenDto)).rejects.toThrow('User Does not Exist');
    });

    it('should throw BadRequestException if token is invalid', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce(foundUser);
      mockPrismaService.emailVerificationToken.findFirst.mockResolvedValueOnce(null);

      await expect(service.verifyEmailToken(verifyEmailTokenDto)).rejects.toThrow('Invalid token provided');
    });

    it('should throw GoneException if token has expired', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce(foundUser);
      mockPrismaService.emailVerificationToken.findFirst.mockResolvedValueOnce({
        id: 'tokenId1',
        token: verifyEmailTokenDto.token,
        iamUserId: verifyEmailTokenDto.userId,
        expiresAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes in past
        isUsed: false,
      });
      mockPrismaService.emailVerificationToken.update.mockResolvedValueOnce({});

      await expect(service.verifyEmailToken(verifyEmailTokenDto)).rejects.toThrow('Otp has expired, please request for another one');
    });
  });

  describe('passwordResetRequest', () => {
    const passwordResetRequestDto = {
      email: 'test@example.com',
    };

    const foundUser = {
      id: 'userId1',
      email: passwordResetRequestDto.email,
    };

    it('should successfully request a password reset token', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce(foundUser);
      mockPrismaService.passwordResetToken.updateMany.mockResolvedValueOnce({});
      mockHelperService.generateToken.mockReturnValueOnce('mockOtp');
      mockPrismaService.passwordResetToken.create.mockResolvedValueOnce({});
      mockEmailService.sendEmail.mockResolvedValueOnce(true);

      const result = await service.passwordResetRequest(passwordResetRequestDto);

      expect(mockPrismaService.iamUser.findUnique).toHaveBeenCalledWith({
        where: {
          email: passwordResetRequestDto.email,
        },
      });
      expect(mockPrismaService.passwordResetToken.updateMany).toHaveBeenCalledWith({
        where: {
          iamUserId: foundUser.id,
        },
        data: {
          isUsed: true,
        },
      });
      expect(mockHelperService.generateToken).toHaveBeenCalled();
      expect(mockPrismaService.passwordResetToken.create).toHaveBeenCalled();
      expect(mockEmailService.sendEmail).toHaveBeenCalled();
      expect(result.message).toBe('An otp has been sent to your email address. Please check your email');
    });

    it('should throw BadRequestException if user does not exist', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce(null);

      await expect(service.passwordResetRequest(passwordResetRequestDto)).rejects.toThrow('User not found');
    });
  });

  describe('verifyEmailToken', () => {
    const verifyEmailTokenDto = {
      userId: 'userId1',
      email: 'test@example.com',
      token: 'validOtp',
    };

    const foundUser = {
      id: 'userId1',
      email: verifyEmailTokenDto.email,
      role: 'USER',
    };

    it('should successfully verify email token', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce(foundUser);
      mockPrismaService.emailVerificationToken.findFirst.mockResolvedValueOnce({
        id: 'tokenId1',
        token: verifyEmailTokenDto.token,
        iamUserId: verifyEmailTokenDto.userId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 5), // 5 minutes in future
        isUsed: false,
      });
      mockPrismaService.emailVerificationToken.update.mockResolvedValueOnce({});
      mockPrismaService.iamUser.update.mockResolvedValueOnce({
        ...foundUser,
        isEmailVerified: true,
      });
      mockHelperService.generateJwtTokens.mockResolvedValueOnce({
        accessToken: 'mockAccessToken',
        refreshToken: 'mockRefreshToken',
      });

      const result = await service.verifyEmailToken(verifyEmailTokenDto);

      expect(mockPrismaService.iamUser.findUnique).toHaveBeenCalledWith({
        where: {
          email_role: {
            email: verifyEmailTokenDto.email,
            role: 'USER',
          },
        },
      });
      expect(mockPrismaService.emailVerificationToken.findFirst).toHaveBeenCalledWith({
        where: {
          token: verifyEmailTokenDto.token,
          iamUserId: verifyEmailTokenDto.userId,
          isUsed: false,
        },
      });
      expect(mockPrismaService.emailVerificationToken.update).toHaveBeenCalledWith({
        where: { id: 'tokenId1' },
        data: { isUsed: true },
      });
      expect(mockPrismaService.iamUser.update).toHaveBeenCalledWith({
        where: { id: verifyEmailTokenDto.userId },
        data: { isEmailVerified: true },
      });
      expect(mockHelperService.generateJwtTokens).toHaveBeenCalledWith({
        sub: foundUser.id,
        email: foundUser.email,
        role: foundUser.role,
      });
      expect(result.message).toBe('Email verification successful');
      expect(result.data.accessToken).toBe('mockAccessToken');
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce(null);

      await expect(service.verifyEmailToken(verifyEmailTokenDto)).rejects.toThrow('User Does not Exist');
    });

    it('should throw BadRequestException if token is invalid', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce(foundUser);
      mockPrismaService.emailVerificationToken.findFirst.mockResolvedValueOnce(null);

      await expect(service.verifyEmailToken(verifyEmailTokenDto)).rejects.toThrow('Invalid token provided');
    });

    it('should throw GoneException if token has expired', async () => {
      mockPrismaService.iamUser.findUnique.mockResolvedValueOnce(foundUser);
      mockPrismaService.emailVerificationToken.findFirst.mockResolvedValueOnce({
        id: 'tokenId1',
        token: verifyEmailTokenDto.token,
        iamUserId: verifyEmailTokenDto.userId,
        expiresAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes in past
        isUsed: false,
      });
      mockPrismaService.emailVerificationToken.update.mockResolvedValueOnce({});

      await expect(service.verifyEmailToken(verifyEmailTokenDto)).rejects.toThrow('Otp has expired, please request for another one');
    });
  });
});
