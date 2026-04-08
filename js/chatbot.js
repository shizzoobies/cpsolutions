/* ============================================
   Computer Solutions - AI Chatbot
   Anthropic Claude-powered with FAQ fallback

   SETUP: Replace the API key below, or better yet,
   proxy through Cloudflare Workers to avoid exposing
   your key in client-side code.
   ============================================ */

// Uses Cloudflare Pages Function at /api/chat
// API key is set as environment variable ANTHROPIC_API_KEY in Cloudflare Pages dashboard
var CHAT_API_URL = '/api/chat';

let chatHistory = [];
let useFallback = false;

// --- FAQ Fallback ---
const FAQ_RESPONSES = {
  hours: "We're open Monday through Friday, 10AM to 6PM. We're closed on weekends. Give us a call at (352) 478-6519!",
  location: "We're located at 255 S Lawrence Blvd, Suite 200, Keystone Heights, FL 32656. Come visit us during business hours!",
  address: "We're located at 255 S Lawrence Blvd, Suite 200, Keystone Heights, FL 32656. Come visit us during business hours!",
  phone: "You can reach us at (352) 478-6519 during business hours (Mon-Fri 10AM-6PM).",
  call: "You can reach us at (352) 478-6519 during business hours (Mon-Fri 10AM-6PM).",
  price: "We offer free diagnostics! Basic services start at $49, standard repairs at $99, and premium services at $149. Visit our pricing page for details.",
  cost: "We offer free diagnostics! Basic services start at $49, standard repairs at $99, and premium services at $149. Visit our pricing page for details.",
  pricing: "We offer free diagnostics! Basic services start at $49, standard repairs at $99, and premium services at $149. Visit our pricing page for details.",
  services: "We offer PC & laptop repair, virus removal (1-year warranty), data recovery, computer sales (new & refurbished), custom computer builds, and business IT support.",
  build: "We build custom PCs for gaming, work, or everyday use — tailored to your needs and budget. Call us at (352) 478-6519 or book online!",
  custom: "We build custom PCs for gaming, work, or everyday use — tailored to your needs and budget. Call us at (352) 478-6519 or book online!",
  gaming: "We build custom gaming PCs! Tell us your budget and we'll put together the perfect build. Call (352) 478-6519 or book online.",
  repair: "We repair PCs and laptops. Bring your device in for a free diagnostic! Book online or call (352) 478-6519.",
  virus: "We provide thorough virus and malware removal with a 1-year warranty. If it comes back, we fix it free!",
  malware: "We provide thorough virus and malware removal with a 1-year warranty. If it comes back, we fix it free!",
  tv: "We no longer offer TV repair, but we can help with all computer and laptop issues! Call us at (352) 478-6519.",
  laptop: "We handle all laptop repairs - screens, batteries, keyboards, charging ports, overheating, and more. All major brands serviced.",
  data: "We offer data recovery from damaged, corrupted, or failed drives. Don't panic - bring it in and we'll see what we can recover!",
  recovery: "We offer data recovery from damaged, corrupted, or failed drives. Don't panic - bring it in and we'll see what we can recover!",
  book: "You can book an appointment on our booking page! Click the 'Book Now' button in the menu, or call us at (352) 478-6519.",
  appointment: "You can book an appointment on our booking page! Click the 'Book Now' button in the menu, or call us at (352) 478-6519.",
  warranty: "All our repairs come with a 1-year warranty. If the issue returns within 1 year, we fix it free of charge.",
  buy: "We sell new and refurbished laptops and desktops at competitive prices. Come visit us to see what's available!",
  computer: "We sell new and refurbished laptops and desktops. We also repair all types of computers. How can we help?",
  sell: "We sell new and refurbished laptops and desktops at competitive prices. Come visit us to see what's available!",
  hello: "Hi there! Welcome to Computer Solutions. How can I help you today?",
  hi: "Hello! Welcome to Computer Solutions. What can I help you with?",
  hey: "Hey! Thanks for reaching out. What can I help you with today?",
  thanks: "You're welcome! Is there anything else I can help you with?",
  thank: "You're welcome! Let us know if you need anything else.",
};

function getFallbackResponse(message) {
  var lower = message.toLowerCase();
  for (var keyword in FAQ_RESPONSES) {
    if (lower.includes(keyword)) {
      return FAQ_RESPONSES[keyword];
    }
  }
  return "I'd be happy to help with that! Click the 'Book Now' button to send us a message and our team will get back to you.";
}

// --- Anthropic API Call ---
async function sendToWorker(userMessage) {
  chatHistory.push({ role: 'user', content: userMessage });

  try {
    var res = await fetch(CHAT_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: chatHistory.slice(-10) })
    });

    if (!res.ok) throw new Error('Worker error: ' + res.status);

    var data = await res.json();
    var reply = data.reply;
    chatHistory.push({ role: 'assistant', content: reply });
    return reply;
  } catch (err) {
    console.warn('Chatbot worker failed, using fallback:', err.message);
    useFallback = true;
    var fallback = getFallbackResponse(userMessage);
    chatHistory.push({ role: 'assistant', content: fallback });
    return fallback;
  }
}

// --- Chat UI ---
document.addEventListener('DOMContentLoaded', function () {
  var chatHTML = '' +
    '<div class="chatbot-bubble" id="chatBubble" aria-label="Open chat">' +
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
    '</div>' +
    '<div class="chatbot-panel" id="chatPanel">' +
      '<div class="chatbot-header">' +
        '<div class="chatbot-header-info">' +
          '<div class="chatbot-status"></div>' +
          '<span>Computer Solutions</span>' +
        '</div>' +
        '<button class="chatbot-close" id="chatClose" aria-label="Close chat">&times;</button>' +
      '</div>' +
      '<div class="chatbot-messages" id="chatMessages">' +
        '<div class="chat-msg bot">' +
          '<div class="chat-msg-bubble">Hi! Welcome to Computer Solutions. How can I help you today?</div>' +
        '</div>' +
      '</div>' +
      '<div class="chatbot-chips" id="chatChips">' +
        '<button class="chat-chip" data-msg="What are your hours?">Hours?</button>' +
        '<button class="chat-chip" data-msg="What services do you offer?">Services?</button>' +
        '<button class="chat-chip" data-msg="I need to book a repair">Book Repair</button>' +
        '<button class="chat-chip" data-msg="Where are you located?">Location?</button>' +
      '</div>' +
      '<form class="chatbot-input" id="chatForm">' +
        '<input type="text" id="chatInput" placeholder="Type a message..." autocomplete="off">' +
        '<button type="submit" aria-label="Send">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>' +
        '</button>' +
      '</form>' +
    '</div>';

  var wrapper = document.createElement('div');
  wrapper.className = 'chatbot-wrapper';
  wrapper.innerHTML = chatHTML;
  document.body.appendChild(wrapper);

  var bubble = document.getElementById('chatBubble');
  var panel = document.getElementById('chatPanel');
  var closeBtn = document.getElementById('chatClose');
  var form = document.getElementById('chatForm');
  var input = document.getElementById('chatInput');
  var messages = document.getElementById('chatMessages');
  var chips = document.getElementById('chatChips');

  bubble.addEventListener('click', function () {
    panel.classList.add('open');
    bubble.classList.add('hidden');
    input.focus();
  });

  closeBtn.addEventListener('click', function () {
    panel.classList.remove('open');
    bubble.classList.remove('hidden');
  });

  function addMessage(text, sender) {
    var div = document.createElement('div');
    div.className = 'chat-msg ' + sender;
    div.innerHTML = '<div class="chat-msg-bubble">' + text.replace(/\n/g, '<br>') + '</div>';
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function showTyping() {
    var div = document.createElement('div');
    div.className = 'chat-msg bot typing-indicator';
    div.id = 'typingIndicator';
    div.innerHTML = '<div class="chat-msg-bubble"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>';
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function removeTyping() {
    var el = document.getElementById('typingIndicator');
    if (el) el.remove();
  }

  async function handleSend(text) {
    if (!text.trim()) return;
    addMessage(text, 'user');
    chips.style.display = 'none';
    input.value = '';
    input.disabled = true;

    showTyping();

    var reply;
    if (useFallback) {
      // Use fallback if previous API failure
      await new Promise(function (r) { setTimeout(r, 600); });
      reply = getFallbackResponse(text);
      chatHistory.push({ role: 'user', content: text });
      chatHistory.push({ role: 'assistant', content: reply });
    } else {
      reply = await sendToWorker(text);
    }

    removeTyping();
    addMessage(reply, 'bot');
    input.disabled = false;
    input.focus();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    handleSend(input.value);
  });

  chips.querySelectorAll('.chat-chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      handleSend(this.getAttribute('data-msg'));
    });
  });
});
