const createTransporter = () => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,          // mail.optimawifi.co.ke
    port: Number(process.env.EMAIL_PORT),  // 465
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,        // support@optimaswifi.co.ke
      pass: process.env.EMAIL_PASS         // ✅ ENV ONLY
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 60_000,
    greetingTimeout: 30_000,
    socketTimeout: 60_000
  });

  if (process.env.NODE_ENV !== 'production') {
    transporter.verify((error) => {
      if (error) {
        console.warn('⚠️ SMTP verify failed:', error.message);
      } else {
        console.log('✅ SMTP ready');
      }
    });
  }

  return transporter;
};
