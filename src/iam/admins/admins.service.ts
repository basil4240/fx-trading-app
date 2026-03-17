import {
  ConflictException,
  GoneException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { IamUser } from '../entities/iam-user.entity';
import { PasswordHistory } from '../entities/password-history.entity';
import { AdminProfile } from 'src/account/entities/admin-profile.entity';
import { AdminRegistrationDto } from './dto/admin-registration.dto';
import { HashingService } from 'src/common/services/hashing/hashing.service';
import { HelperService } from 'src/common/services/helper/helper.service';
import { Role } from 'src/common/enums/role.enum';
import { DataResponse } from 'src/common/responses';
import { UserRegistrationResponse } from '../users/responses/user-registration.response';
import { LoginDto } from '../dto/login.dto';
import { UserLoginResponse } from '../users/responses/user-login.response';
import { AccountStatus } from 'src/common/enums/account-status.enum';
import { ActiveUserData } from 'src/common/interfaces/active-user-data.interface';

@Injectable()
export class AdminsService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly helperService: HelperService,
    private readonly dataSource: DataSource,
    @InjectRepository(IamUser)
    private readonly userRepo: Repository<IamUser>,
  ) {}

  async register(
    adminRegistrationDto: AdminRegistrationDto,
  ): Promise<DataResponse<UserRegistrationResponse>> {
    const foundAdmin = await this.userRepo.findOne({
      where: {
        email: adminRegistrationDto.email,
        role: Role.Admin,
      },
    });

    if (foundAdmin) {
      throw new ConflictException('Admin already exist');
    }

    const hashedPassword = await this.hashingService.hash(
      adminRegistrationDto.password,
    );

    const iamAdmin = await this.dataSource.transaction(async (manager) => {
      const admin = manager.create(IamUser, {
        email: adminRegistrationDto.email,
        passwordHash: hashedPassword,
        role: Role.Admin,
        isEmailVerified: true,
        isVerified: true,
      });
      const savedAdmin = await manager.save(admin);

      const adminProfile = manager.create(AdminProfile, {
        iamUserId: savedAdmin.id,
        department: adminRegistrationDto.department,
        employeeId: adminRegistrationDto.employeeId,
      });
      await manager.save(adminProfile);

      await manager.save(PasswordHistory, {
        iamUserId: savedAdmin.id,
        passwordHash: hashedPassword,
      });
      return savedAdmin;
    });

    return {
      message: 'Admin registration successful',
      data: {
        userId: iamAdmin.id,
        email: iamAdmin.email,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<DataResponse<UserLoginResponse>> {
    const foundAdmin = await this.userRepo.findOne({
      where: {
        email: loginDto.email,
        role: Role.Admin,
      },
    });

    if (!foundAdmin) {
      throw new NotFoundException('Invalid Credentials');
    }

    const isValidPassword = await this.hashingService.compare(
      loginDto.password,
      foundAdmin.passwordHash,
    );

    if (!isValidPassword) {
      throw new NotFoundException('Invalid Credentials');
    }

    if (foundAdmin.accountStatus === AccountStatus.Suspended) {
      throw new UnauthorizedException(`Admin account suspended`);
    }

    const tokenPayload: ActiveUserData = {
      sub: foundAdmin.id,
      email: foundAdmin.email,
      role: foundAdmin.role,
    };

    const { accessToken, refreshToken } =
      await this.helperService.generateJwtTokens(tokenPayload);

    return {
      message: 'Admin login successful',
      data: {
        userId: foundAdmin.id,
        email: foundAdmin.email,
        accessToken,
        refreshToken,
      },
    };
  }
}
