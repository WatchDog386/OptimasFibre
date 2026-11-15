// Creates admin accounts, or resets the password of accounts that already exist.
//
//   npm run create-admin -- Bosley Rose Felix          (usernames)
//   npm run create-admin -- you@example.com            (an email login)
//
// Every account named gets the same password. You are asked for it (it is not shown
// while you type); for scripted use set ADMIN_PASSWORD instead. Passwords are never
// stored in this file. Usernames are case-insensitive when signing in.
import './src/config/env.js';
import readline from 'readline';

const logins = process.argv.slice(2).map((arg) => arg.trim()).filter(Boolean);

if (!logins.length) {
  console.error('Usage: npm run create-admin -- <username or email> [more usernames or emails...]');
  process.exit(1);
}

const askHidden = (question) => new Promise((resolve) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  let muted = false;
  rl._writeToOutput = (text) => {
    if (!muted) rl.output.write(text);
  };
  rl.question(question, (answer) => {
    rl.output.write('\n');
    rl.close();
    resolve(answer);
  });
  muted = true;
});

let password = process.env.ADMIN_PASSWORD;
if (!password) {
  password = await askHidden(`Password for ${logins.join(', ')} (min 8 characters): `);
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

let failed = false;
try {
  await connectDB();
} catch (error) {
  console.error('❌ Could not connect to the database:', error.message);
  process.exit(1);
}

for (const login of logins) {
  const isEmail = login.includes('@');
  const key = login.toLowerCase();
  // "Bosley" → username "bosley", shown in the dashboard as "Bosley"
  const displayName = isEmail ? '' : login.charAt(0).toUpperCase() + login.slice(1);

  try {
    const existing = await User.unscoped().findOne({ where: isEmail ? { email: key } : { username: key } });
    if (existing) {
      existing.password = password;
      existing.role = 'admin';
      if (displayName && !existing.name) existing.name = displayName;
      await existing.save();
      console.log(`✅ Updated admin: ${login} (password reset)`);
    } else {
      await User.create({
        ...(isEmail ? { email: key } : { username: key }),
        name: displayName,
        password,
        role: 'admin'
      });
      console.log(`✅ Created admin: ${login}`);
    }
  } catch (error) {
    failed = true;
    console.error(`❌ ${login}:`, error.errors?.map((item) => item.message).join(', ') || error.message);
  }
}

await sequelize.close();
process.exit(failed ? 1 : 0);
