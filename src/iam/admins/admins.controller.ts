import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { AdminsService } from './admins.service';
import { AdminRegistrationDto } from './dto/admin-registration.dto';
import { DataResponse } from 'src/common/responses';
import { UserRegistrationResponse } from '../users/responses/user-registration.response';
import { LoginDto } from '../dto/login.dto';
import { UserLoginResponse } from '../users/responses/user-login.response';

@ApiTags('IAM - Admins')
@Controller('iam/admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new admin account' })
  @ApiCreatedResponse({
    description: 'Admin successfully registered.',
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
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() adminRegistrationDto: AdminRegistrationDto,
  ): Promise<DataResponse<UserRegistrationResponse>> {
    return this.adminsService.register(adminRegistrationDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Logs in an admin with email and password' })
  @ApiOkResponse({
    description: 'Admin successfully logged in.',
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
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<DataResponse<UserLoginResponse>> {
    return this.adminsService.login(loginDto);
  }
}
