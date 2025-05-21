import { Controller, Post, Body, NotFoundException } from '@nestjs/common';
import { EmployeeService } from './employee.service';

@Controller('login')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  async login(@Body('barcode') barcode: string) {
    const result = await this.employeeService.loginWithBarcode(barcode);
    if (!result) {
      throw new NotFoundException('Barcode tidak ditemukan');
    }
    return result;
  }
}
