const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://kanjiradical-1022170672500.europe-west1.run.app/', { waitUntil: 'networkidle0' });
  const html = await page.content();
  console.log(html.substring(0, 500));
  console.log("ROOT CONTENT LENGTH:", (await page.$eval('#root', el => el.innerHTML)).length);
  await browser.close();
})();
