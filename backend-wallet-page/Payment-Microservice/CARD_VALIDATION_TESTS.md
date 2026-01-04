# Credit Card Validation Testing Guide

## How to Test the Credit Card Validation

### Test via Static HTML (topUp.html)
1. Open `topUp.html` directly in your browser
2. Select "Credit Card" radio button
3. Enter an amount (e.g., 500)
4. Try these test cases:

#### Test Case 1: Invalid Card Number (too short)
- Card Number: `1234567890` (10 digits)
- MM/YY: `08/26`
- CVC: `123`
- Cardholder: `John Doe`
- **Expected**: Error message "Invalid card number. Please enter 12-19 digits."

#### Test Case 2: Invalid Card Number (too long)
- Card Number: `12345678901234567890` (20 digits)
- MM/YY: `08/26`
- CVC: `123`
- Cardholder: `John Doe`
- **Expected**: Error message "Invalid card number. Please enter 12-19 digits."

#### Test Case 3: Invalid Expiration Date (wrong format)
- Card Number: `4532015112830366` (16 digits - valid)
- MM/YY: `8-26` (wrong format)
- CVC: `123`
- Cardholder: `John Doe`
- **Expected**: Error message "Invalid expiration date. Use MM/YY format (e.g., 08/26)."

#### Test Case 4: Invalid Expiration Date (invalid month)
- Card Number: `4532015112830366`
- MM/YY: `13/26` (month 13 invalid)
- CVC: `123`
- Cardholder: `John Doe`
- **Expected**: Error message "Invalid expiration date. Use MM/YY format (e.g., 08/26)."

#### Test Case 5: Invalid CVC (too short)
- Card Number: `4532015112830366`
- MM/YY: `08/26`
- CVC: `12` (only 2 digits)
- Cardholder: `John Doe`
- **Expected**: Error message "Invalid CVC. Please enter 3-4 digits."

#### Test Case 6: Invalid CVC (too long)
- Card Number: `4532015112830366`
- MM/YY: `08/26`
- CVC: `12345` (5 digits)
- **Expected**: Maxlength attribute prevents entry, can't enter more than 4 digits

#### Test Case 7: Missing Cardholder Name
- Card Number: `4532015112830366`
- MM/YY: `08/26`
- CVC: `123`
- Cardholder: `` (empty)
- **Expected**: Error message "Please enter the cardholder name."

#### Test Case 8: Cardholder Name Too Short
- Card Number: `4532015112830366`
- MM/YY: `08/26`
- CVC: `123`
- Cardholder: `A` (only 1 character)
- **Expected**: Error message "Please enter the cardholder name."

#### Test Case 9: All Valid ✓
- Card Number: `4532015112830366` (Visa test card - 16 digits)
- MM/YY: `08/26`
- CVC: `123`
- Cardholder: `John Doe`
- **Expected**: Review modal opens showing "₱500" and "PAY WITH DEBIT / CREDIT"
- Click "CONFIRM TOP-UP" → Success modal appears

#### Test Case 10: Alternative Valid Card
- Card Number: `5425233010103442` (Mastercard test - 16 digits)
- MM/YY: `12/25`
- CVC: `1234` (4-digit CVC)
- Cardholder: `Jane Smith`
- **Expected**: Review modal opens → Success modal

#### Test Case 11: Minimum Valid Card Number (12 digits)
- Card Number: `123456789012` (12 digits - minimum valid)
- MM/YY: `01/25`
- CVC: `123`
- Cardholder: `Min Valid`
- **Expected**: Review modal opens

#### Test Case 12: Maximum Valid Card Number (19 digits)
- Card Number: `1234567890123456789` (19 digits - maximum valid)
- MM/YY: `12/30`
- CVC: `1234`
- Cardholder: `Max Valid`
- **Expected**: Review modal opens

### Test via React Component (TopUpPage.jsx)

1. Run: `npm run dev` in the Payment-Microservice folder
2. Navigate to http://localhost:5173/topup
3. Enter amount and select "Credit Card"
4. Repeat the same test cases above
5. Inline error messages should appear below the "Confirm Top-up" button

### Test GCash Option (Bypass Card Validation)

1. Select "GCash" radio button
2. Enter amount (e.g., 500)
3. Click "Confirm Top-up"
4. **Expected**: Review modal opens immediately WITHOUT any card field validation
5. Card fields should be disabled/readonly when GCash is selected

## Valid Test Card Numbers

### Visa
- `4532015112830366` (16 digits)
- `4532111111111111` (16 digits)

### Mastercard
- `5425233010103442` (16 digits)
- `5555555555554444` (16 digits)

### American Express
- `374245455400126` (15 digits)
- `378282246310005` (15 digits)

## Notes
- Card validation only applies to Credit Card payment method
- GCash has no card field requirements
- All validation messages are user-friendly and specific to the error
- Card inputs auto-format where applicable (expiry date gets "/" automatically in React)
