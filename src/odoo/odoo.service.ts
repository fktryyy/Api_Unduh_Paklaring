import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OdooService {
  private readonly url = 'http://localhost:8069/jsonrpc';
  private readonly db = 'SSM';
  private readonly username = 'admin@ssmindonesia.com';
  private readonly password = 'a';

  private uid: number | null = null;
  private logger = new Logger(OdooService.name);

  private async login(): Promise<void> {
    try {
      const res = await axios.post(this.url, {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: 'common',
          method: 'login',
          args: [this.db, this.username, this.password],
        },
        id: Math.floor(Math.random() * 1000),
      });

      if (!res.data.result) {
        throw new Error('Login ke Odoo gagal, uid kosong');
      }

      this.uid = res.data.result;
      this.logger.log(`Login sukses, uid: ${this.uid}`);
    } catch (error) {
      this.logger.error('Gagal login ke Odoo', error);
      throw error;
    }
  }

  public async searchRead(model: string, domain: any[], fields: string[]): Promise<any[]> {
    if (!this.uid) {
      await this.login();
    }

    try {
      const res = await axios.post(this.url, {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: 'object',
          method: 'execute_kw',
          args: [
            this.db,
            this.uid,
            this.password,
            model,
            'search_read',
            [domain],            // domain sebagai list (contoh: [['field', '=', value]])
            { fields },          // kwargs berupa object { fields: [...] }
          ],
        },
        id: Math.floor(Math.random() * 1000),
      });

      if (res.data.error) {
        throw new Error(`Odoo RPC error: ${JSON.stringify(res.data.error)}`);
      }

      return res.data.result;
    } catch (error) {
      this.logger.error('Error saat memanggil search_read', error);
      throw error;
    }
  }
}
