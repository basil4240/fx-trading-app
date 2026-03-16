import { Injectable } from '@nestjs/common';
import { CreateFxDto } from './dto/create-fx.dto';
import { UpdateFxDto } from './dto/update-fx.dto';

@Injectable()
export class FxService {
  create(createFxDto: CreateFxDto) {
    return 'This action adds a new fx';
  }

  findAll() {
    return `This action returns all fx`;
  }

  findOne(id: number) {
    return `This action returns a #${id} fx`;
  }

  update(id: number, updateFxDto: UpdateFxDto) {
    return `This action updates a #${id} fx`;
  }

  remove(id: number) {
    return `This action removes a #${id} fx`;
  }
}
