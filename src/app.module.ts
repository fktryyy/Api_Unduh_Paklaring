import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmployeeModule } from './employee/employee.module';
import { OdooModule } from './odoo/odoo.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Supaya ConfigService bisa digunakan di semua module tanpa perlu import ulang
    }),
    EmployeeModule,
    OdooModule,
  ],
})
export class AppModule {}
