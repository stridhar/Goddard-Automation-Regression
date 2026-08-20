import { chromium, test, expect } from "@playwright/test";
import fs from 'fs';
import * as yaml from 'js-yaml';
import path from 'path';
import { faker } from '@faker-js/faker';

test("TestTourUpdate.io Scenario", async ({ browser }) => {
const context = await browser.newContext();
const page = await context.newPage();

const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

// Load test data from YAML
const filePath = path.resolve(__dirname, '..', 'src', 'data', 'testData.yml');
console.log('Resolved Path:', filePath);
const testData = yaml.load(fs.readFileSync(filePath, 'utf8'));

console.log('__dirname:', __dirname);
console.log('Resolved Path:', filePath);
console.log('File Exists:', fs.existsSync(filePath));

// 1. Visit the Consumer portal
console.log("🔹 Navigating to the Goddard School form page...");
await page.goto('https://www-qa.goddardschool.com/schools/pa/weatherly/weatherly-i/our-school/find-tour-info?source=widget?automatedTest=true');

const cookieButton = page.locator('//*[@id="onetrust-accept-btn-handler"]'); // or 'text=Got it', 'text=Close', etc.
if (await cookieButton.isVisible()) {
  await cookieButton.click();
}
console.log("📝 Starting the booking process...");

// 2. Verify the text "Help us find your tour" to make sure the user is on the correct page
await expect(page.locator("text=Help us find your tour")).toBeVisible();

// 3. Fill the email address & Confirmation code from the external YAML file
await page.fill('input[name="TourEmailOrPhone"]', testData.tours.email);
console.log('Email Address:', testData.tours.email);
await page.fill('input[name="TourConfirmationId"]', testData.tours.confirmationCode);
console.log('Confirmation Code:', testData.tours.confirmationCode);

// 4. Submit the form
await page.getByRole('button', { name: 'Submit' }).click();
console.log("Form submitted successfully");

const dateTimeObject = page.locator("text=Select a new date & time");
await dateTimeObject.waitFor({ state: 'visible' });

// 5. Verify the tour form is displayed to the user
await expect(page.locator("text=Select a new date & time")).toBeVisible();

// 6. Select a new date from the calendar control and select time slot
const availableGridCell = page.locator('[role="gridcell"]:not([aria-disabled="true"])').first();
await availableGridCell.waitFor({ state: 'visible'});
await availableGridCell.click();

const firstSlot = page.locator('a.gsi-tour-form__tour-link').first();
await firstSlot.waitFor({ state: 'visible' });
await firstSlot.click();

// 7. Click on 'Next' button
await page.getByRole('button', {name: 'Next', exact: true}).click();

// 8. Pre tour confirmation page
const confirmTourButton = page.getByRole('button', {name: 'Confirm Tour'});
await confirmTourButton.waitFor({ state: 'visible' });
await confirmTourButton.click();

// 9. Tour confirmation page and complete the tour booking
await expect(page.locator("text=Your Tour is Confirmed!")).toBeVisible();

// Complete the application
await context.close();
});