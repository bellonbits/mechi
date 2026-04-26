
export async function getMpesaToken() {
  const consumerKey = Deno.env.get('MPESA_CONSUMER_KEY');
  const consumerSecret = Deno.env.get('MPESA_CONSUMER_SECRET');
  
  const auth = btoa(`${consumerKey}:${consumerSecret}`);
  
  const response = await fetch(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  );
  
  const data = await response.json();
  return data.access_token;
}

export function generatePassword(shortCode: string, passKey: string, timestamp: string) {
  return btoa(`${shortCode}${passKey}${timestamp}`);
}

export function getTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/[-:T]/g, '').split('.')[0];
}
