const crypto = require('crypto');

const webhookSecret = '814fea9ee2efe412b6929cd2b5a02617cbde386317f24869a096ef6f423ef9f2';
const webhookUrl = 'https://jjrbqoacpcoshsspknbi.supabase.co/functions/v1/lipana-webhook';

const payload = {
  event: 'payment.success',
  data: {
    transactionId: 'test-txn-' + Date.now(),
    amount: 100,
    phone: '+254712345678'
  }
};

const rawBody = JSON.stringify(payload);

// Generate signature
const hmac = crypto.createHmac('sha256', webhookSecret);
hmac.update(rawBody);
const signature = hmac.digest('hex');

console.log('Sending Payload:', rawBody);
console.log('Generated Signature:', signature);

fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-lipana-signature': signature
  },
  body: rawBody
})
.then(res => res.json())
.then(data => {
  console.log('Webhook Response:', data);
})
.catch(err => {
  console.error('Fetch error:', err);
});
