import { Test, TestingModule } from '@nestjs/testing';
import { ValkeyService } from './valkey.service';

describe('ValkeyService', () => {
  let service: ValkeyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ValkeyService],
    }).compile();

    service = module.get<ValkeyService>(ValkeyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
