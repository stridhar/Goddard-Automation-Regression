import { chromium, test, expect } from "@playwright/test";
import { PublicWebsiteLead } from '../tests/utils/helper';
import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';
import { faker } from '@faker-js/faker';

test("TestLead.io Scenario", async ({ browser }) => {
const context = await browser.newContext();
const page = await context.newPage();

const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

// Load test data from YAML
const filePath = path.resolve(__dirname, '..', 'src', 'data', 'testData.yml');
console.log('Resolved Path:', filePath);
const testData = yaml.load(fs.readFileSync(filePath, 'utf8'));

// 1. Visit the Consumer portal
console.log("🔹 Navigating to the Goddard School form page...");
await page.goto('https://www-qa.goddardschool.com/schools/pa/weatherly/weatherly-i/our-school/goddard-form?automatedTest=true');

const cookieButton = page.locator('//*[@id="onetrust-accept-btn-handler"]'); // or 'text=Got it', 'text=Close', etc.
if (await cookieButton.isVisible()) {
  await cookieButton.click();
}
console.log("📝 Starting the booking process...");

// 2. Verify the text "How many children are you interested in enrolling?" to make sure the user is on the correct page
await expect(
  page.locator("text=How many children are you interested in enrolling?")
).toBeVisible();
const dropdown = page.locator('select[name="Number of Children"]');
await dropdown.selectOption('1');

//3. Click on 'Next' button
await page.click("text=Next");

//4. Select the child's birth date from the calendar, filled from an external yaml file
await expect(page.locator("text=Already completed this form?")).toBeVisible();
// Child Date of birth
const today = new Date();
const birthDate = await new PublicWebsiteLead(page).birthDateChild();
await page.locator('[name="Birth Date"]').fill(birthDate);

//5. Enter child name reading from a external yaml file
await page.fill('input[name="Child Name"]', testData.lead.ChildName);
console.log(testData.lead.ChildName);

//6. Click on 'Next' button
await page.getByRole('button', { name: 'Next' }).click();

//7.Select child preferred start date
const preferredDate = await new PublicWebsiteLead(page).preferredStartDate();
await page.locator('[name="Preferred Start Date"]').fill(preferredDate);

//8. Click on 'Next' button
await page.getByRole('button', { name: 'Next' }).click();

//9. check the Contact info page and enter details
await expect(page.locator("text=Contact info")).toBeVisible();

//Fill the first name
const firstName = faker.person.firstName();
await page.fill('input[name="First Name"]', firstName);
console.log('First Name:', firstName);
//Fill the last name
const lastName = faker.person.lastName();
await page.fill('input[name="Last Name"]', lastName);
console.log('Last Name:', lastName);
//Fill the ZIP code
await page.fill('input[name="ZIP Code"]', String(testData.lead.ZIPCode));
console.log(testData.lead.ZIPCode);
//Fill the phone number
await page.fill('input[name="Phone Number"]', String(testData.lead.PhoneNumber));
console.log(testData.lead.PhoneNumber);

//Fill the email address
const email = await new PublicWebsiteLead(page).email(firstName, lastName);
await page.fill('input[name="Email Address"]', email);
console.log('Email Address:', email);

//10. Submit the form
await page.getByRole('button', { name: 'Submit' }).click();
console.log("Form submitted successfully");

// 11. Verify the tour form is displayed to the user
const customizeTour = page.locator("text=Customize Your Tour");
await customizeTour.waitFor({ state: 'visible' });

// Complete the application
await context.close();
});