/* ============================================
   Computer Solutions - Site Configuration

   CLIENT: Edit the values below with your API keys.
   This is the ONLY file you need to change.
   ============================================ */

var SITE_CONFIG = {
  // Cloudflare Worker URL for AI chatbot
  // Deploy the Chatworker repo and paste the URL here
  CHAT_WORKER_URL: 'https://cs-chat-proxy.tgqhg6kf4g.workers.dev',

  // Web3Forms access key for contact/callback forms
  // Get yours free at https://web3forms.com
  WEB3FORMS_KEY: 'YOUR_WEB3FORMS_KEY',

  // Google Places API (for live reviews)
  // Proxy URL from your Cloudflare Worker that calls Google Places API
  REVIEWS_PROXY_URL: '',
  GOOGLE_PLACE_ID: 'YOUR_PLACE_ID',
};
