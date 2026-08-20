import { request } from '@playwright/test';

export async function SolveCaptcha(siteKey: string, pageUrl: string) {
  const requestContext = await request.newContext();
  const apiKey = '54076ccecedecf1dc640b4f70dbd1562'; // Replace with your 2Captcha API key
  
  // Submit CAPTCHA solving request
const response = await requestContext.get(`http://2captcha.com/in.php`, {
    params: {
        key: apiKey,
        method: "userrecaptcha",
        googlekey: siteKey,
        pageurl: pageUrl,
        json: 1
    }
});

const jsonResponse = await response.json();
if (jsonResponse.status !== 1) {
    throw new Error(`2Captcha submission failed: ${jsonResponse.request}`);
}

const requestId = jsonResponse.request;
console.log("Received CAPTCHA Request ID:", requestId);
  
}
