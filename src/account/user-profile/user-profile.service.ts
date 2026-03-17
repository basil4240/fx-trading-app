import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from '../entities/user-profile.entity';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UpdateKycDto } from './dto/update-kyc.dto';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
  ) {}

  async findByUserId(userId: string): Promise<UserProfile> {
    const profile = await this.userProfileRepository.findOne({
      where: { iamUserId: userId },
    });
    if (!profile) {
      throw new NotFoundException(`User profile for user ${userId} not found`);
    }
    return profile;
  }

  async update(userId: string, updateUserProfileDto: UpdateUserProfileDto): Promise<UserProfile> {
    const profile = await this.findByUserId(userId);
    Object.assign(profile, updateUserProfileDto);
    return this.userProfileRepository.save(profile);
  }

  async updateKyc(userId: string, updateKycDto: UpdateKycDto): Promise<UserProfile> {
    const profile = await this.findByUserId(userId);
    profile.kycStatus = updateKycDto.status;
    return this.userProfileRepository.save(profile);
  }

  async findAll(): Promise<UserProfile[]> {
    return this.userProfileRepository.find();
  }
}
