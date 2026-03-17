import { Test, TestingModule } from '@nestjs/testing';
import { HelperService } from './helper.service';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import jwtConfig from '@src/common/config/jwt.config';

describe('HelperService', () => {
  let service: HelperService;
  let mockHttpService: Partial<HttpService>;
  let mockPrismaService: Partial<PrismaService>;
  let mockJwtService: Partial<JwtService>;
  let mockCacheManager: any;

  beforeEach(async () => {
    mockHttpService = {};
    mockPrismaService = {};
    mockJwtService = {};
    mockCacheManager = {
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HelperService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        {
          provide: jwtConfig.KEY,
          useValue: {
            secret: 'test_secret',
            refreshSecret: 'test_refresh_secret',
            tokenAudience: 'test_audience',
            tokenIssuer: 'test_issuer',
            accessTokenTtl: '1h',
            refreshTokenTtl: '7d',
          },
        },
      ],
    }).compile();

    service = module.get<HelperService>(HelperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateUniqueString', () => {
    it('should generate a unique string of default length', () => {
      const uniqueString = service.generateUniqueString();
      expect(typeof uniqueString).toBe('string');
      expect(uniqueString.length).toBe(10); // Default length is 10
    });

    it('should generate a unique string of specified length', () => {
      const length = 32;
      const uniqueString = service.generateUniqueString('', '', length); // Corrected call
      expect(typeof uniqueString).toBe('string');
      expect(uniqueString.length).toBe(length);
    });

    it('should generate different strings on successive calls', () => {
      const string1 = service.generateUniqueString();
      const string2 = service.generateUniqueString();
      expect(string1).not.toBe(string2);
    });
  });

  describe('calculatePaginationMeta', () => {
    it('should correctly calculate meta for multiple pages', () => {
      const total = 100;
      const paginationDto = { page: 2, limit: 10 };
      const meta = service.calculatePaginationMeta(total, paginationDto);

      expect(meta).toEqual({
        total: 100,
        page: 2,
        pageSize: 10,
        lastPage: 10,
        hasNextPage: true,
        hasPrevPage: true,
      });
    });

    it('should correctly calculate meta for the first page', () => {
      const total = 50;
      const paginationDto = { page: 1, limit: 10 };
      const meta = service.calculatePaginationMeta(total, paginationDto);

      expect(meta).toEqual({
        total: 50,
        page: 1,
        pageSize: 10,
        lastPage: 5,
        hasNextPage: true,
        hasPrevPage: false,
      });
    });

    it('should correctly calculate meta for the last page', () => {
      const total = 45;
      const paginationDto = { page: 5, limit: 10 };
      const meta = service.calculatePaginationMeta(total, paginationDto);

      expect(meta).toEqual({
        total: 45,
        page: 5,
        pageSize: 10,
        lastPage: 5,
        hasNextPage: false,
        hasPrevPage: true,
      });
    });

    it('should handle total less than limit', () => {
      const total = 5;
      const paginationDto = { page: 1, limit: 10 };
      const meta = service.calculatePaginationMeta(total, paginationDto);

      expect(meta).toEqual({
        total: 5,
        page: 1,
        pageSize: 10,
        lastPage: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });
    });

    it('should handle zero total', () => {
      const total = 0;
      const paginationDto = { page: 1, limit: 10 };
      const meta = service.calculatePaginationMeta(total, paginationDto);

      expect(meta).toEqual({
        total: 0,
        page: 1,
        pageSize: 10,
        lastPage: 0,
        hasNextPage: false,
        hasPrevPage: false,
      });
    });
  });
});