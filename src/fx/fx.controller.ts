import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FxService } from './fx.service';
import { CreateFxDto } from './dto/create-fx.dto';
import { UpdateFxDto } from './dto/update-fx.dto';

@Controller('fx')
export class FxController {
  constructor(private readonly fxService: FxService) {}

  @Post()
  create(@Body() createFxDto: CreateFxDto) {
    return this.fxService.create(createFxDto);
  }

  @Get()
  findAll() {
    return this.fxService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fxService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFxDto: UpdateFxDto) {
    return this.fxService.update(+id, updateFxDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fxService.remove(+id);
  }
}
