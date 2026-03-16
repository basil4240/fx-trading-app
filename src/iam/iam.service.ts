import { Injectable } from '@nestjs/common';
import { CreateIamDto } from './dto/create-iam.dto';
import { UpdateIamDto } from './dto/update-iam.dto';

@Injectable()
export class IamService {
  create(createIamDto: CreateIamDto) {
    return 'This action adds a new iam';
  }

  findAll() {
    return `This action returns all iam`;
  }

  findOne(id: number) {
    return `This action returns a #${id} iam`;
  }

  update(id: number, updateIamDto: UpdateIamDto) {
    return `This action updates a #${id} iam`;
  }

  remove(id: number) {
    return `This action removes a #${id} iam`;
  }
}
