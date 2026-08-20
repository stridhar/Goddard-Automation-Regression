import { chromium, test, expect } from "@playwright/test";
import { PublicWebsiteLead } from '../tests/utils/helper';
test.setTimeout(60000);
import fs from 'fs';
import * as yaml from 'js-yaml';
import path from 'path';
import { faker } from '@faker-js/faker';

test("TestTour.io Scenario", async ({ browser }) => {
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
  page.locator("text=How many children are you interested in enrolling?")).toBeVisible();
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

//7.Select preferred start date
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

//12. Fill areas of interest and any specific questions optional field
await page.fill('textarea[name="tourFormStep1Questions"]', "Test data for the areas of interest and any specific questions optional field");

//13. Click on 'Next' button
await page.getByRole('button', { name: 'Next' }).click();

//14. Await & verify customize your tour page 2 load
const chooseDateTime = page.locator("text=Choose a Date & Time");
await chooseDateTime.waitFor({ state: 'visible' });
//Select a preferred date from the calendar control and select time slot
const availableGridCell = page.locator('[role="gridcell"]:not([aria-disabled="true"])').first();
await availableGridCell.waitFor({ state: 'visible'});
await availableGridCell.click();

const firstSlot = page.locator('a.gsi-tour-form__tour-link').first();
await firstSlot.waitFor({ state: 'visible' });
await firstSlot.click();

//15. Click on 'Next' button
await page.getByRole('button', {name: 'Next', exact: true}).click();

//16. Pre tour confirmation page
await expect(
page.getByRole('button', { name: /confirm tour/i })).toBeVisible({ timeout: 50000 });
await page.getByRole('button', { name: /confirm tour/i }).click();

//17. Tour confirmation page and complete the tour booking
const tourConfirmed = page.locator("text=Your Tour is Confirmed!");
await page.waitForTimeout(10000);
await tourConfirmed.waitFor({ state: 'visible' });

// 18. Read the confirmation code and log it to the console
const ConfirmationCodeLocator = page.locator('.gsi-tour-confirmation__item--code small');
await ConfirmationCodeLocator.waitFor({ state: 'visible' });
const ConfirmationCode =await ConfirmationCodeLocator.textContent();
console.log(ConfirmationCode);

// 19. Email & Confirmation code data to append into YAML file 
// for future use in testTourUpdate.spec.js
const testTourData = {
email: email,
confirmationCode: ConfirmationCode
};

try {
// Read existing YAML
const fileContents = fs.readFileSync(filePath, 'utf8');
const data = yaml.load(fileContents) || {};
// Ensure `data.tours` is an array. If it's a single object, convert to an array.
if (!data.tours) {
  data.tours = [];
} else if (!Array.isArray(data.tours)) {
  data.tours = [data.tours];
}

// Append new record
data.tours.push(testTourData);

// Write back to YAML
fs.writeFileSync(filePath, yaml.dump(data), 'utf8');

console.log('Data appended successfully.');
} catch (err) {
console.error('Error updating YAML file:', err);
}

console.log(testTourData);

// Complete the application
await context.close();
});