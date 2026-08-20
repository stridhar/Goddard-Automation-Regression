
import { Page } from '@playwright/test';
import { faker } from '@faker-js/faker';

export class PublicWebsiteLead {
constructor(page) {
this.page = page;
}
// Generate email address and return
async email(firstName, lastName, provider = 'pwsqa.com') {
const email = faker.internet.email({
firstName: `aut_${firstName}`,
lastName,
provider,
});
return email;
}

// Generate preferred start date (1 month from today) and return
preferredStartDate() {
const preferredStartDate = new Date();
preferredStartDate.setMonth(preferredStartDate.getMonth() + 1);
// Format MM/DD/YYYY
const formatPreferDate = (date) => {
const mm = String(date.getMonth() + 1).padStart(2, '0');
const dd = String(date.getDate()).padStart(2, '0');
const yyyy = date.getFullYear();
return `${mm}/${dd}/${yyyy}`;
};
return formatPreferDate(preferredStartDate);
}

// Generate Child Date of birth (5 years ago) and return
birthDateChild(){
const birthDateChild = new Date();
birthDateChild.setFullYear(birthDateChild.getFullYear() - 5);

// Format MM/DD/YYYY
    const formatDate = (date) => {
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const yyyy = date.getFullYear();
      return `${mm}/${dd}/${yyyy}`;
    };
return formatDate(birthDateChild);
}

}

