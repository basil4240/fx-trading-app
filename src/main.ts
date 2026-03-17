import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomValidationPipe } from './common/pipes/custom-validation/custom-validation.pipe';
import { ConfigService } from '@nestjs/config';
import { INestApplication, Logger } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions/all-exceptions.filter';
import { HttpExceptionFilter } from './common/filters/http-exception/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

function configureSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('FX Trading API')
    .setDescription(
      'The official API documentation for the FX Trading Application. This API facilitates foreign exchange trading, multi-currency wallet management, and automated currency conversion (supporting NGN, USD, EUR, GBP, and more).',
    )
    .setVersion('1.0')
    .addTag(
      'IAM - Users',
      'Endpoints for user registration, authentication, and security',
    )
    .addTag('Account', 'Management of user accounts and profiles')
    .addTag(
      'Wallet',
      'Financial operations, balances, and multi-currency support',
    )
    .addTag('FX', 'Currency pair management and exchange rate configurations')
    .addTag('Trading', 'Operations for executing and managing currency trades')
    .addTag('Audit', 'System-wide activity logs and audit trails')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'FX Trading API Documentation',
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Register global filters
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

  // Register global pipes
  app.useGlobalPipes(new CustomValidationPipe());

  configureSwagger(app);

  const configService = app.get(ConfigService);
  const port = configService.get('PORT');

  const logger = new Logger('Bootstrap');

  await app.listen(port || 3000);
  const url = await app.getUrl();
  logger.log(`FX Trading Application is running on: ${url}`);
  logger.log(`FX Trading Swagger docs available at: ${url}/api/docs`);
}
void bootstrap();
