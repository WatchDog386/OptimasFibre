// HTML → PDF rendering (headless Chrome via Puppeteer)
import puppeteer from 'puppeteer';

const launchOptions = () => {
  const options = {
    headless: true,
    args: (process.env.PUPPETEER_ARGS || '--no-sandbox,--disable-setuid-sandbox,--disable-dev-shm-usage')
      .split(',')
      .map((arg) => arg.trim())
      .filter(Boolean)
  };
  if (process.env.PUPPETEER_EXECUTABLE_PATH) options.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  return options;
};

/** Renders an HTML document to an A4 PDF and returns it as a Buffer. */
export const renderPdf = async (html) => {
  let browser;
  try {
    browser = await puppeteer.launch(launchOptions());
    const page = await browser.newPage();
    // 'load' rather than 'networkidle0': a slow or missing logo must not block the document.
    await page.setContent(html, { waitUntil: 'load', timeout: 20000 });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });
    return Buffer.from(pdf);
  } catch (error) {
    console.error('⚠️ PDF generation failed:', error.message);
    const wrapped = new Error('Failed to generate PDF');
    wrapped.statusCode = 500;
    wrapped.cause = error;
    throw wrapped;
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
};
