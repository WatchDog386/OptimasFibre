// backend/src/index.js — server startup
import './config/env.js';

const required = ['JWT_SECRET', 'DATABASE_URL', 'FRONTEND_URL'];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
  console.error('❌ Missing env vars in backend/.env:', missing.join(', '));
  process.exit(1);
}
if (process.env.JWT_SECRET.length < 32) {
  console.error('❌ JWT_SECRET is too short. Generate one with: openssl rand -hex 32');
  process.exit(1);
}

const { default: connectDB, sequelize } = await import('./config/db.js');
const { default: app } = await import('./app.js');

const PORT = Number(process.env.PORT) || 10000;
// Behind Nginx the API only needs to listen locally; set HOST=0.0.0.0 to expose it directly.
const HOST = process.env.HOST || '127.0.0.1';

try {
  await connectDB();
} catch (error) {
  console.error('💥 Could not connect to PostgreSQL:', error.message);
  process.exit(1);
}

const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`🌍 ENV: ${process.env.NODE_ENV || 'development'}`);
});

const shutdown = (signal) => {
  console.log(`\n${signal} received — shutting down`);
  server.close(async () => {
    await sequelize.close().catch(() => {});
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
