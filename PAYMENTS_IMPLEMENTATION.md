# Morocco payments

Implemented payment choices:

- Stripe for international card payments in USD.
- Cash on delivery with a server-validated pending order.
- Payzone hosted-checkout adapter with a signed server callback.

## Required Payzone configuration

Add these variables in Vercel and local `.env`:

```env
NEXT_PUBLIC_APP_URL=https://your-domain.example
PAYZONE_CHECKOUT_URL=https://checkout-url-issued-by-payzone
PAYZONE_MERCHANT_ID=merchant-id-issued-by-payzone
PAYZONE_SECRET=secret-issued-by-payzone
```

The Payzone adapter intentionally keeps provider field mapping in one server action and one callback route. Confirm the exact field names and signature formula from the merchant integration pack before enabling production card payments.

## Order statuses

- `pending_cod_confirmation`
- `pending_payzone`
- `paid`
- `payment_failed`
- Stripe statuses such as `succeeded`

Existing columns remain unchanged. The payment reference uses the existing `paymentIntentID` column so this change does not require an immediate database migration.
