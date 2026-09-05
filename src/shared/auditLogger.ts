import fs from 'fs/promises';
import path from 'path';

const AUDIT_FILE_PATH = path.resolve(process.cwd(), 'error-audit.log');

export const auditLogError = (errorData: any): void => {
  const timestamp = new Date().toISOString();
  const logEntry = JSON.stringify({ timestamp, ...errorData }) + '\n';
  
  // Fire-and-forget async write — never blocks the request/response cycle
  fs.appendFile(AUDIT_FILE_PATH, logEntry, { encoding: 'utf-8' }).catch((err) => {
    console.error('Failed to write to audit log file:', err);
  });
};
