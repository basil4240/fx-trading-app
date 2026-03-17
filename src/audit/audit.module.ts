import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { LedgerEntry } from './entities/ledger-entry.entity';
import { AuditLog } from './entities/audit-log.entity';
import { CommonModule } from 'src/common/common.module';

@Global()
@Module({
  imports: [CommonModule, TypeOrmModule.forFeature([LedgerEntry, AuditLog])],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
