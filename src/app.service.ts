import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Fx Server is running (I will add a simple front end to this route if time permits)';
  }
}
