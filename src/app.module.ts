import { Module } from '@nestjs/common';
import { EmployeeModule } from './employee/employee.module';
import { OdooModule } from './odoo/odoo.module';

@Module({
  imports: [EmployeeModule, OdooModule],
})
export class AppModule {}
