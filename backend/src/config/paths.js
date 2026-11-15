import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const BACKEND_ROOT = path.resolve(__dirname, '../..');
export const UPLOADS_DIR = path.join(BACKEND_ROOT, 'uploads');
export const LOGS_DIR = path.join(BACKEND_ROOT, 'logs');
