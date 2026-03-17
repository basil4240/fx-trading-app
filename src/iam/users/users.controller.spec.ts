import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import { HelperService } from 'src/common/services/helper/helper.service';
import { HashingService } from 'src/common/services/hashing/hashing.service';
import { EmailService } from 'src/common/services/email/email.service';
import appConfig from 'src/common/config/app.config';

describe('UsersController', () => {
  let controller: UsersController;
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

  const mockHelperService = {
    generateToken: jest.fn(),
    generateJwtTokens: jest.fn(),
  };

  const mockHashingService = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  const mockEmailService = {
    sendEmail: jest.fn(),
  };

  const mockAppConfig = {
    supportEmail: 'support@example.com',
  };


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: HelperService,
          useValue: mockHelperService,
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
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  // it('should be defined', () => {
  //   expect(controller).toBeDefined();
  // });
});
