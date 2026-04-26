# Mechi - Setup & Deployment Guide (Lipana.dev v1)

## 1. Supabase Setup
1. Create a new Supabase project.
2. Run the SQL in `supabase/migrations/20240425000000_init_schema.sql`.
3. Deploy Edge Functions:
   ```bash
   supabase functions deploy initiate-payment
   supabase functions deploy mpesa-callback --no-verify-jwt
   supabase functions deploy verify-payment
   ```
4. Set secrets in Supabase:
   ```bash
   supabase secrets set LIPANA_SECRET_KEY=lip_sk_live_...
   supabase secrets set LIPANA_WEBHOOK_SECRET=your_webhook_secret_from_dashboard
   ```

## 2. Frontend Setup
1. Copy `.env.example` to `.env` and fill in credentials.
2. Install dependencies: `npm install`.
3. Run dev: `npm run dev`.

## 3. Official API Integration (lipana.dev)
- **Base URL**: `https://api.lipana.dev/v1`
- **STK Push**: `POST /transactions/push-stk`
- **Webhook Events**:
  - `payment.success`: Activates user's 7-day premium.
  - `payment.failed`: Marks transaction as failed.
- **Signature Verification**: Highly recommended for production. Set `LIPANA_WEBHOOK_SECRET` to enable.

## 4. Testing
- Use **Sandbox Keys** (`lip_sk_test_...`) and the test phone number `+254708374149` (returns success) or `+254708374150` (returns failure) to test the flow without real money.
