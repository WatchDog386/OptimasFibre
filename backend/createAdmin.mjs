// Creates an admin account, or resets the password of an existing one.
//
//   npm run create-admin -- you@example.com
//
// You are asked for the password (it is not shown while you type). For scripted use,
// set ADMIN_PASSWORD in the environment instead. Passwords are never stored in this file.
import './src/config/env.js';
import readline from 'readline';

const email = (process.argv[2] || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const name = (process.argv[3] || '').trim();

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Usage: npm run create-admin -- <email> ["Full Name"]');
  process.exit(1);
}

const askHidden = (question) => new Promise((resolve) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  rl.stdoutMuted = false;
  rl._writeToOutput = (text) => {
    if (!rl.stdoutMuted) rl.output.write(text);
  };
  rl.question(question, (answer) => {
    rl.output.write('\n');
    rl.close();
    resolve(answer);
  });
  rl.stdoutMuted = true;
});

let password = process.env.ADMIN_PASSWORD;
if (!password) {
  password = await askHidden(`Password for ${email} (min 8 characters): `);
  const again = await askHidden('Repeat password: ');
  if (password !== again) {
    console.error('❌ Passwords do not match.');
    process.exit(1);
  }
}
if (!password || password.length < 8) {
  console.error('❌ Password must be at least 8 characters.');
  process.exit(1);
}

const { default: connectDB, sequelize } = await import('./src/config/db.js');
const { User } = await import('./src/models/index.js');

try {
  await connectDB();
  const existing = await User.unscoped().findOne({ where: { email } });

  if (existing) {
    existing.password = password;
    existing.role = 'admin';
    if (name) existing.name = name;
    await existing.save();
    console.log(`✅ Updated admin: ${email} (password reset)`);
  } else {
    await User.create({ email, password, role: 'admin', name });
    console.log(`✅ Created admin: ${email}`);
  }
  await sequelize.close();
} catch (error) {
  console.error('❌ Could not create admin:', error.errors?.map((item) => item.message).join(', ') || error.message);
  process.exit(1);
}
