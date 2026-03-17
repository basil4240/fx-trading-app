import { Test, TestingModule } from '@nestjs/testing';
import { HashingService } from './hashing.service';
import { BcryptService } from './bcrypt/bcrypt.service'; // New Import

describe('HashingService', () => {
  let service: HashingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: HashingService, // Provide the abstract class token
          useClass: BcryptService, // Use the concrete implementation
        },
      ],
    }).compile();

    service = module.get<HashingService>(HashingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hash', () => {
    it('should hash a password', async () => {
      const password = 'testpassword123';
      const hashedPassword = await service.hash(password);
      expect(typeof hashedPassword).toBe('string');
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(0);
    });
  });

  describe('compare', () => {
    it('should return true for matching passwords', async () => {
      const password = 'testpassword123';
      const hashedPassword = await service.hash(password);
      const isMatch = await service.compare(password, hashedPassword);
      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      const password = 'testpassword123';
      const wrongPassword = 'wrongpassword';
      const hashedPassword = await service.hash(password);
      const isMatch = await service.compare(wrongPassword, hashedPassword);
      expect(isMatch).toBe(false);
    });

    it('should return false for invalid hash format', async () => {
      const password = 'testpassword123';
      const invalidHash = 'invalidhash'; // bcrypt hashes are typically longer and start with $2a or $2b
      const isMatch = await service.compare(password, invalidHash);
      expect(isMatch).toBe(false);
    });
  });
});