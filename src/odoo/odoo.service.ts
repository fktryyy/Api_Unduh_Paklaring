import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class OdooService {
  private readonly url: string;
  private readonly db: string;
  private readonly username: string;
  private readonly password: string;

  private uid: number | null = null;
  private logger = new Logger(OdooService.name);

  constructor(private configService: ConfigService) {
    this.url = this.configService.get<string>('ODOO_URL') ?? (() => { throw new Error('ODOO_URL is not defined'); })();
    this.db = this.configService.get<string>('ODOO_DB') ?? (() => { throw new Error('ODOO_DB is not defined'); })();
    this.username = this.configService.get<string>('ODOO_USERNAME') ?? (() => { throw new Error('ODOO_USERNAME is not defined'); })();
    this.password = this.configService.get<string>('ODOO_PASSWORD') ?? (() => { throw new Error('ODOO_PASSWORD is not defined'); })();

    this.logger.log(`Odoo Config Loaded: url=${this.url}, db=${this.db}, username=${this.username}`);
  }

  private async login(): Promise<void> {
    try {
      const payload = {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: 'common',
          method: 'login',
          args: [this.db, this.username, this.password],
        },
        id: Math.floor(Math.random() * 1000),
      };

      this.logger.log(`Login request payload: ${JSON.stringify(payload)}`);

      const res = await axios.post(this.url, payload);

      this.logger.log(`Login response: ${JSON.stringify(res.data)}`);

      if (!res.data || !res.data.result || typeof res.data.result !== 'number') {
        throw new Error(`Login ke Odoo gagal, uid kosong atau tidak valid: ${JSON.stringify(res.data)}`);
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
      const payload = {
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
            [domain],
            { fields },
          ],
        },
        id: Math.floor(Math.random() * 1000),
      };

      this.logger.log(`searchRead request payload: ${JSON.stringify(payload)}`);

      const res = await axios.post(this.url, payload);

      this.logger.log(`searchRead response: ${JSON.stringify(res.data)}`);

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
