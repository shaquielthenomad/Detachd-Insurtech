import sql from 'mssql';

// REAL Azure SQL Database Configuration from existing detachd-sql-76c5c226
const config: sql.config = {
  server: 'detachd-sql-76c5c226.database.windows.net',
  database: 'detachd-db',
  user: 'detachdadmin',
  password: process.env.AZURE_SQL_PASSWORD || 'your_actual_sql_password',
  port: 1433,
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true,
    connectionTimeout: 30000,
    requestTimeout: 30000,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool: sql.ConnectionPool | null = null;

export async function getConnection(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = new sql.ConnectionPool(config);
    await pool.connect();
  }
  return pool;
}

export async function executeQuery<T = any>(query: string, params?: any[]): Promise<T[]> {
  const connection = await getConnection();
  const request = connection.request();
  
  if (params) {
    params.forEach((param, index) => {
      request.input(`param${index}`, param);
    });
  }
  
  const result = await request.query(query);
  return result.recordset;
}

export async function executeStoredProcedure<T = any>(
  procedureName: string, 
  params?: { [key: string]: any }
): Promise<T[]> {
  const connection = await getConnection();
  const request = connection.request();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });
  }
  
  const result = await request.execute(procedureName);
  return result.recordset;
}

export class DatabaseService {
  private pool: sql.ConnectionPool | null = null;

  async getConnection(): Promise<sql.ConnectionPool> {
    if (!this.pool) {
      this.pool = new sql.ConnectionPool(config);
      await this.pool.connect();
    }
    return this.pool;
  }

  async query<T = any>(query: string, params?: Array<{ name: string; value: any }>): Promise<{ recordset: T[] }> {
    const connection = await this.getConnection();
    const request = connection.request();
    
    if (params) {
      params.forEach(param => {
        request.input(param.name, param.value);
      });
    }
    
    const result = await request.query(query);
    return { recordset: result.recordset };
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.close();
      this.pool = null;
    }
  }
} 