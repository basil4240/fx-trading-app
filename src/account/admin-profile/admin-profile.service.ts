import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminProfile } from '../entities/admin-profile.entity';
import { UpdateAdminProfileDto } from './dto/update-admin-profile.dto';
import { UpdateAdminScopeDto } from './dto/update-admin-scope.dto';

@Injectable()
export class AdminProfileService {
  constructor(
    @InjectRepository(AdminProfile)
    private readonly adminProfileRepository: Repository<AdminProfile>,
  ) {}

  async findByUserId(userId: string): Promise<AdminProfile> {
    const profile = await this.adminProfileRepository.findOne({
      where: { iamUserId: userId },
    });
    if (!profile) {
      throw new NotFoundException(`Admin profile for user ${userId} not found`);
    }
    return profile;
  }

  async update(userId: string, updateAdminProfileDto: UpdateAdminProfileDto): Promise<AdminProfile> {
    const profile = await this.findByUserId(userId);
    Object.assign(profile, updateAdminProfileDto);
    return this.adminProfileRepository.save(profile);
  }

  async updateScope(userId: string, updateAdminScopeDto: UpdateAdminScopeDto): Promise<AdminProfile> {
    const profile = await this.findByUserId(userId);
    profile.permissionsScope = updateAdminScopeDto.permissionsScope;
    return this.adminProfileRepository.save(profile);
  }

  async findAll(): Promise<AdminProfile[]> {
    return this.adminProfileRepository.find();
  }
}
