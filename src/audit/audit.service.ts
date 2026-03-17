import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { LedgerEntry } from './entities/ledger-entry.entity';
import { AuditLog } from './entities/audit-log.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(LedgerEntry)
    private readonly ledgerRepo: Repository<LedgerEntry>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepo: Repository<AuditLog>,
  ) {}

  /**
   * Records a financial movement in the immutable ledger.
   * Can be used within a transaction by passing an EntityManager.
   */
  async recordLedgerEntry(
    data: Partial<LedgerEntry>,
    manager?: EntityManager,
  ): Promise<LedgerEntry> {
    const repo = manager ? manager.getRepository(LedgerEntry) : this.ledgerRepo;
    const entry = repo.create(data);
    return repo.save(entry);
  }

  /**
   * Records a system-wide action in the audit logs.
   */
  async recordAuditLog(data: Partial<AuditLog>): Promise<AuditLog> {
    const log = this.auditLogRepo.create(data);
    return this.auditLogRepo.save(log);
  }

  /**
   * Retrieves paginated ledger entries for a user.
   */
  async getLedger(userId: string, paginationDto: PaginationDto) {
    const { limit = 10, page = 1 } = paginationDto;
    const offset = (page - 1) * limit;

    const [items, total] = await this.ledgerRepo.findAndCount({
      where: { iamUserId: userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { items, total };
  }

  /**
   * Retrieves paginated audit logs (Admin only).
   */
  async getLogs(paginationDto: PaginationDto) {
    const { limit = 10, page = 1 } = paginationDto;
    const offset = (page - 1) * limit;

    const [items, total] = await this.auditLogRepo.findAndCount({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
      relations: ['iamUser'],
    });

    return { items, total };
  }
}
