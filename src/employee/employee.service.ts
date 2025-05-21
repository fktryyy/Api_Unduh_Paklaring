import { Injectable } from '@nestjs/common';
import { OdooService } from '../odoo/odoo.service';

@Injectable()
export class EmployeeService {
  constructor(private readonly odooService: OdooService) {}

  async loginWithBarcode(barcode: string) {
    // Cari karyawan berdasarkan barcode
    const [employee] = await this.odooService.searchRead('hr.employee', [['barcode', '=', barcode]], ['id', 'name', 'barcode']);
    if (!employee) return null;

    // Cari file surat berdasarkan employee_id
    const [letter] = await this.odooService.searchRead('hr.employee.letter', [['employee_id', '=', employee.id]], ['file_url']);

    return {
      id: employee.id,
      name: employee.name,
      barcode: employee.barcode,
      file_url: letter?.file_url || null,
    };
  }
}
