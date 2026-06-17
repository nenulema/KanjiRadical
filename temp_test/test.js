const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  await page.goto('https://kanjiradical-1022170672500.europe-west1.run.app/', { waitUntil: 'networkidle2' });
  await browser.close();
})();
