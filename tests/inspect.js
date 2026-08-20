const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1600 } });
  const page = await context.newPage();
  await page.goto('https://www-qa.goddardschool.com/schools/pa/weatherly/weatherly-i/our-school/goddard-form?automatedTest=true', { waitUntil: 'domcontentloaded' });
  const cookieButton = page.locator('//*[@id="onetrust-accept-btn-handler"]');
  if (await cookieButton.isVisible().catch(() => false)) await cookieButton.click();
  await page.fill('input[name="Email Address"]', 'aut_Glen.Hand@pwsqa.com');
  await page.fill('input[name="Verification"]', 'Hand');
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.fill('textarea[name="tourFormStep1Questions"]', 'Test data');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.waitForTimeout(6000);
  const bodyText = await page.locator('body').textContent();
  console.log(bodyText.slice(0, 6000));
  const all = await page.locator('button, a, [role="button"], [role="link"], input, [aria-label]').evaluateAll(els => els.map(el => ({
    tag: el.tagName.toLowerCase(),
    text: (el.textContent || '').trim(),
    ariaLabel: el.getAttribute('aria-label'),
    role: el.getAttribute('role'),
    name: el.getAttribute('name'),
    type: el.getAttribute('type'),
    disabled: el.getAttribute('disabled') || el.getAttribute('aria-disabled'),
    className: (el.className || '').slice(0, 200)
  })).filter(x => x.text || x.ariaLabel || x.name || x.role));
  console.log(JSON.stringify(all.filter(x => x.ariaLabel || x.text?.includes('PM') || x.text?.includes('AM') || x.text?.includes('Date') || x.text?.includes('Time')).slice(0, 300), null, 2));
  await browser.close();
})().catch(err => { console.error(err); process.exit(1); });
