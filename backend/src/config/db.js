// PostgreSQL connection (Sequelize)
import './env.js';
import { Sequelize } from 'sequelize';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL is not defined. Add it to backend/.env, e.g.');
  console.error('   DATABASE_URL=postgres://optimas:PASSWORD@127.0.0.1:5432/optimas');
  process.exit(1);
}

export const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  pool: { max: 10, min: 0, idle: 10000, acquire: 30000 },
  // Only needed for managed/remote databases; a local server on the same VM does not use SSL.
  dialectOptions: process.env.DB_SSL === 'true'
    ? { ssl: { require: true, rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' } }
    : {}
});

/**
 * Connects to PostgreSQL and creates any missing tables.
 * Existing tables are never altered or dropped.
 */
const connectDB = async () => {
  await sequelize.authenticate();
  // Models must be registered before sync — importing the index does that.
  await import('../models/index.js');
  await sequelize.sync();
  const { runMigrations } = await import('./migrations.js');
  await runMigrations(sequelize);
  console.log(`✅ PostgreSQL connected: ${sequelize.config.host}:${sequelize.config.port}/${sequelize.config.database}`);
};

export const isDatabaseUp = async () => {
  try {
    await sequelize.authenticate();
    return true;
  } catch {
    return false;
  }
};

export default connectDB;
