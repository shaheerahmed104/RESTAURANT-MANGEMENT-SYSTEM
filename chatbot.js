/* =====================================================
   chatbot.js  -  Rule-based chatbot (no AI service needed)

   How it works:
   1. The user's message is cleaned (lowercase, no punctuation).
   2. We go through the INTENTS list from top to bottom.
   3. The first intent whose test matches gives the answer.
   4. Answers use the real menu and prices from localStorage.
   ===================================================== */

// The 25 suggested questions shown as buttons
const CHAT_QUESTIONS = [
  'What dishes are available?',
  'What is the price of a burger?',
  'What pizzas do you offer?',
  'Which dishes are spicy?',
  'Do you have vegetarian food?',
  'What desserts are available?',
  'What drinks do you serve?',
  'What are your popular dishes?',
  'What deals are available?',
  'Do you have family deals?',
  'What are your opening hours?',
  'Where is your restaurant located?',
  'Do you offer delivery?',
  'What is the delivery fee?',
  'How long does delivery take?',
  'How can I order food?',
  'How can I track my order?',
  'What payment methods are available?',
  'Can I customize my food?',
  'What ingredients are in a dish?',
  'How can I book a table?',
  'Can I cancel my order?',
  'What is your cheapest dish?',
  'What is your most expensive dish?',
  'How can I contact the restaurant?'
];

// Words that mean a menu category
const CATEGORY_WORDS = {
  'Burgers': ['burger'],
  'Pizza': ['pizza'],
  'BBQ & Grill': ['bbq', 'grill', 'barbecue', 'kebab'],
  'Mains': ['main'],
  'Pasta': ['pasta'],
  'Starters': ['starter', 'appetizer', 'appetiser', 'snack'],
  'Desserts': ['dessert', 'sweet'],
  'Drinks': ['drink', 'beverage']
};

// ---------- Small helper functions ----------
function normalizeText(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s&-]/g, ' ').replace(/\s+/g, ' ').trim();
}

// "pizzas" -> "pizza", "fries" -> "fry"  (so plural and singular match)
function singular(word) {
  if (word.length > 4 && word.endsWith('ies')) return word.slice(0, -3) + 'y';
  if (/(ses|xes|ches|shes)$/.test(word)) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}

function words(text) {
  return normalizeText(text).split(' ').map(singular);
}

function pkr(amount) { return formatPKR(amount); }

function dishLine(d) {
  return `<li>${escapeHtml(d.name)} - <strong>${pkr(d.price)}</strong></li>`;
}

// Bullet list of dishes (shows at most `max` items)
function dishList(dishes, max) {
  const shown = dishes.slice(0, max || 8);
  let html = '<ul>' + shown.map(dishLine).join('') + '</ul>';
  if (dishes.length > shown.length) {
    html += `<small>...and ${dishes.length - shown.length} more on the <a href="menu.html">menu page</a>.</small>`;
  }
  return html;
}

// Which menu category is mentioned in the text? (returns dishes or null)
function findCategoryDishes(text) {
  const tokens = words(text);
  for (const [category, keywords] of Object.entries(CATEGORY_WORDS)) {
    if (keywords.some(k => tokens.includes(k))) {
      const dishes = getMenu().filter(d => d.category === category);
      if (dishes.length) return { category, dishes };
    }
  }
  return null;
}

// Which dishes does the user mean? 1) full name  2) category  3) word match
function findDishes(text) {
  const clean = normalizeText(text);
  const menu = getMenu();

  const exact = menu.filter(d => clean.includes(normalizeText(d.name)));
  if (exact.length) return exact;

  const byCategory = findCategoryDishes(text);
  if (byCategory) return byCategory.dishes;

  const ignore = ['with', 'half', 'pcs', 'fresh', 'what', 'price', 'much', 'cost', 'dish', 'food'];
  const tokens = words(text).filter(w => w.length >= 4 && !ignore.includes(w));
  return menu.filter(d => {
    const nameWords = words(d.name);
    return tokens.some(t => nameWords.includes(t));
  });
}

function sortedByPrice() {
  return getMenu().slice().sort((a, b) => a.price - b.price);
}

const FAQ_LINKS = {
  menu: '<a href="menu.html">Menu</a>',
  deals: '<a href="deals.html">Deals</a>',
  booking: '<a href="booking.html">Book a Table</a>',
  contact: '<a href="contact.html">Contact page</a>'
};

// =====================================================
//  The intents (order matters: specific ones first)
// =====================================================
const INTENTS = [
  {
    name: 'greeting',
    test: t => /^(hi|hello|hey|salam|assalam|aoa|good morning|good afternoon|good evening)\b/.test(t) && t.split(' ').length <= 4,
    reply: () => 'Hello and welcome to <strong>Royal Feast</strong>! I can help with the menu, prices, deals, delivery, orders and table booking. What would you like to know?'
  },
  {
    name: 'thanks',
    test: t => /\b(thanks|thank you|thx|shukria|jazakallah)\b/.test(t),
    reply: () => 'You are most welcome! Is there anything else I can help you with?'
  },
  {
    name: 'bye',
    test: t => /\b(bye|goodbye|see you|allah hafiz|khuda hafiz)\b/.test(t),
    reply: () => 'Thank you for visiting Royal Feast. Have a wonderful day!'
  },
  {
    name: 'cancel',
    test: t => /\b(cancel|cancellation|refund)\b/.test(t),
    reply: t => /table|reserv|booking/.test(t)
      ? `You can cancel a reservation up to 2 hours before your booking time. Please call <strong>${RESTAURANT.phone}</strong> with your reservation ID (like RES-1234).`
      : `You can cancel an order only while its status is <strong>Pending</strong>. Please call us immediately on <strong>${RESTAURANT.phone}</strong> with your order number. Once the kitchen starts <em>Preparing</em> the food, it cannot be cancelled.`
  },
  {
    name: 'track',
    test: t => /\btrack|order status|status of|where is my order|my order|order number|order id/.test(t),
    reply: () => 'After you place an order you get an order number like <strong>RF-20261011-1234</strong>. Type that number here and I will show you its current status (Pending, Preparing, Ready or Completed). You can also call ' + RESTAURANT.phone + '.'
  },
  {
    name: 'cheapest',
    test: t => /cheap|lowest price|least expensive|most affordable|budget|low cost/.test(t),
    reply: () => {
      const list = sortedByPrice();
      if (!list.length) return 'The menu is empty right now.';
      return `Our cheapest dish is <strong>${escapeHtml(list[0].name)}</strong> at <strong>${pkr(list[0].price)}</strong>.` +
        (list.length > 2 ? '<br>Other budget picks:' + '<ul>' + list.slice(1, 4).map(dishLine).join('') + '</ul>' : '');
    }
  },
  {
    name: 'expensive',
    test: t => /expensive|costliest|highest price|priciest|most costly/.test(t),
    reply: () => {
      const list = sortedByPrice().reverse();
      if (!list.length) return 'The menu is empty right now.';
      return `Our most expensive dish is <strong>${escapeHtml(list[0].name)}</strong> at <strong>${pkr(list[0].price)}</strong>.` +
        (list.length > 2 ? '<br>Other premium dishes:' + '<ul>' + list.slice(1, 3).map(dishLine).join('') + '</ul>' : '');
    }
  },
  {
    name: 'deliveryFee',
    test: t => /deliver/.test(t) && /fee|charge|cost|price|free/.test(t),
    reply: () => `Delivery costs <strong>${pkr(DELIVERY_FEE)}</strong>. It is <strong>free</strong> on orders above ${pkr(FREE_DELIVERY_OVER)}. Takeaway and dine-in orders have no delivery charge.`
  },
  {
    name: 'deliveryTime',
    test: t => /deliver/.test(t) && /how long|how fast|how soon|time|minutes|take|arrive|eta|duration/.test(t),
    reply: () => 'Delivery usually takes <strong>30 to 45 minutes</strong>, depending on your area, traffic and weather. Takeaway orders are ready in about 20 minutes.'
  },
  {
    name: 'delivery',
    test: t => /deliver/.test(t),
    reply: () => `Yes, we deliver! Delivery charge is ${pkr(DELIVERY_FEE)} (free above ${pkr(FREE_DELIVERY_OVER)}). Add dishes to your cart and choose <strong>Delivery</strong> at checkout.`
  },
  {
    name: 'ingredients',
    test: t => /ingredient|made of|made with|made from|what s in|what is in|contain|allerg|composition/.test(t),
    reply: t => {
      const found = findDishes(t);
      if (!found.length || found.length > 4) {
        return 'Tell me the dish name and I will list its ingredients, for example: <em>"ingredients in Chicken Biryani"</em>. Every dish also lists its ingredients if you ask me by name. For allergies, please tell us when ordering.';
      }
      return found.map(d =>
        `<strong>${escapeHtml(d.name)}</strong>: ${escapeHtml(d.ingredients || d.desc)}`
      ).join('<br><br>');
    }
  },
  {
    name: 'price',
    test: t => /\bprice|\bcost|how much|\brate\b|\bpkr\b|\brs\b/.test(t),
    reply: t => {
      const found = findDishes(t);
      if (found.length) return 'Here are the prices:' + dishList(found, 8);
      const list = sortedByPrice();
      if (!list.length) return 'The menu is empty right now.';
      return `Which dish would you like the price of? For example: <em>"price of Chicken Biryani"</em>. Our dishes range from ${pkr(list[0].price)} to ${pkr(list[list.length - 1].price)}. See the full ${FAQ_LINKS.menu}.`;
    }
  },
  {
    name: 'family',
    test: t => /family|families|party|large group|big group/.test(t),
    reply: () => {
      const deals = DEALS.filter(d => d.family);
      return 'Yes! Our family deals:<ul>' +
        deals.map(d => `<li><strong>${escapeHtml(d.name)}</strong> - ${pkr(d.price)}<br><small>${escapeHtml(d.items)}</small></li>`).join('') +
        `</ul>See all on the ${FAQ_LINKS.deals} page.`;
    }
  },
  {
    name: 'deals',
    test: t => /\bdeals?\b|discount|combo|promo|\boffers\b|special offer|any offer/.test(t),
    reply: () =>
      'Current deals:<ul>' +
      DEALS.map(d => `<li><strong>${escapeHtml(d.name)}</strong> - ${pkr(d.price)} <small>(was ${pkr(d.oldPrice)})</small></li>`).join('') +
      `</ul>Plus: ${DISCOUNT_RATE * 100}% off orders of ${pkr(DISCOUNT_MIN)}+ and free delivery above ${pkr(FREE_DELIVERY_OVER)}. See the ${FAQ_LINKS.deals} page.`
  },
  {
    name: 'popular',
    test: t => /popular|best seller|bestseller|best dish|favou?rite|recommend|most ordered|signature|top dish/.test(t),
    reply: () => {
      const menu = getMenu();
      let popular = menu.filter(d => d.popular);
      if (!popular.length) popular = menu.slice(0, 4);
      return 'Our most-loved dishes:' + dishList(popular, 8);
    }
  },
  {
    name: 'hours',
    test: t => /\bopen|\bclose|closing|hours|timing|what time/.test(t),
    reply: () => `We are open <strong>${RESTAURANT.hours}</strong>. Last table booking is at 11:00 PM.`
  },
  {
    name: 'location',
    test: t => /\bwhere\b|location|address|located|directions|find you|branch/.test(t),
    reply: () => `You can find us at <strong>${RESTAURANT.address}</strong>. Need help? Call ${RESTAURANT.phone}.`
  },
  {
    name: 'contact',
    test: t => /contact|phone|email|call you|call us|reach|whatsapp|talk to/.test(t),
    reply: () => `You can reach us by:<ul><li>Phone: <strong>${RESTAURANT.phone}</strong></li><li>Email: <strong>${RESTAURANT.email}</strong></li><li>Or send a message from the ${FAQ_LINKS.contact}.</li></ul>`
  },
  {
    name: 'payment',
    test: t => /\bpay\b|payment|\bcard\b|\bcash\b|jazzcash|easypaisa|credit|debit/.test(t),
    reply: () => `We accept: <strong>${PAYMENT_METHODS.join(', ')}</strong>. (In this demo project no real payment is processed.)`
  },
  {
    name: 'customize',
    test: t => /custom|modif|extra|without|less spicy|more spicy|no onion|special request|instruction/.test(t),
    reply: () => 'Yes! At checkout, write your request in the <strong>Special Instructions</strong> box, for example <em>"less spicy, no onions, extra cheese"</em>. Our chefs will do their best to prepare it your way.'
  },
  {
    name: 'spicy',
    test: t => /spic|chili|chilli|mirch|\bhot\b/.test(t),
    reply: () => {
      const spicy = getMenu().filter(d => d.spicy);
      if (!spicy.length) return 'None of our dishes are marked spicy right now.';
      return 'Spicy dishes:' + dishList(spicy, 10) + '<small>You can ask for less spice in the checkout notes.</small>';
    }
  },
  {
    name: 'vegetarian',
    test: t => /\bveg|vegetarian|vegan|meat free|meatless/.test(t),
    reply: () => {
      const veg = getMenu().filter(d => d.veg);
      if (!veg.length) return 'We do not have vegetarian dishes listed right now.';
      return 'Yes! Vegetarian options:' + dishList(veg, 8);
    }
  },
  {
    name: 'booking',
    test: t => /\bbook|reserv|\btable\b/.test(t),
    reply: () => `Open the ${FAQ_LINKS.booking} page, choose a date, time and number of guests, enter your name and phone and press <strong>Reserve Table</strong>. You will get a reservation ID instantly.`
  },
  {
    name: 'howToOrder',
    test: t => /how.*(order|buy|place)|place.*order|order food|ordering|order online/.test(t),
    reply: () => `Ordering is easy:<ol><li>Open the ${FAQ_LINKS.menu} and press <strong>Add</strong> on your dishes.</li><li>Open the <a href="cart.html">Cart</a> and check quantities.</li><li>Go to <a href="checkout.html">Checkout</a>, fill in your details and press <strong>Place Order</strong>.</li></ol>`
  },
  {
    name: 'takeaway',
    test: t => /takeaway|take away|pick up|pickup|dine in|dine-in|dining/.test(t),
    reply: () => 'We offer <strong>Dine-in</strong>, <strong>Takeaway</strong> and <strong>Delivery</strong>. Choose your order type at checkout. Takeaway and dine-in orders have no delivery charge.'
  },
  {
    name: 'halal',
    test: t => /halal/.test(t),
    reply: () => 'Yes, all our meat is 100% halal.'
  },
  {
    name: 'category',
    test: t => findCategoryDishes(t) !== null,
    reply: t => {
      const result = findCategoryDishes(t);
      return `Our <strong>${escapeHtml(result.category)}</strong>:` + dishList(result.dishes, 10);
    }
  },
  {
    name: 'menu',
    test: t => /menu|dishes|food|available|serve|\bitems\b|what do you (have|sell)|categories|eat/.test(t),
    reply: () => {
      const menu = getMenu();
      if (!menu.length) return 'The menu is empty right now. Please check back soon!';
      const counts = {};
      menu.forEach(d => { counts[d.category] = (counts[d.category] || 0) + 1; });
      return `We have <strong>${menu.length} dishes</strong> in these categories:<ul>` +
        Object.entries(counts).map(([cat, n]) => `<li>${escapeHtml(cat)} (${n})</li>`).join('') +
        `</ul>Ask me about any category, e.g. <em>"What pizzas do you offer?"</em>, or open the full ${FAQ_LINKS.menu}.`;
    }
  }
];

// =====================================================
//  Main function: question in, answer out
// =====================================================
function getBotReply(rawText) {
  const raw = rawText.trim();

  // Order number typed in? Look it up in saved orders.
  const orderMatch = raw.match(/RF-\d{8}-\d{4}/i);
  if (orderMatch) {
    const order = getOrders().find(o => o.orderNumber.toUpperCase() === orderMatch[0].toUpperCase());
    if (!order) {
      return { intent: 'orderLookup', html: `I could not find order <strong>${escapeHtml(orderMatch[0].toUpperCase())}</strong>. Please check the number and try again.` };
    }
    return {
      intent: 'orderLookup',
      html: `Order <strong>${escapeHtml(order.orderNumber)}</strong><br>Status: <strong>${escapeHtml(order.status)}</strong><br>` +
        `Items: ${order.items.reduce((s, i) => s + i.qty, 0)} | Total: ${pkr(order.total)}<br>Type: ${escapeHtml(order.orderType)}`
    };
  }

  // Reservation ID typed in?
  const resMatch = raw.match(/RES-\d{4}/i);
  if (resMatch) {
    const res = getReservations().find(r => r.id.toUpperCase() === resMatch[0].toUpperCase());
    if (!res) {
      return { intent: 'reservationLookup', html: `I could not find reservation <strong>${escapeHtml(resMatch[0].toUpperCase())}</strong>.` };
    }
    return {
      intent: 'reservationLookup',
      html: `Reservation <strong>${escapeHtml(res.id)}</strong><br>Status: <strong>${escapeHtml(res.status)}</strong><br>` +
        `${formatDateKey(res.date)} at ${formatTime(res.time)} for ${res.guests} guest(s).`
    };
  }

  const text = normalizeText(raw);
  for (const intent of INTENTS) {
    if (intent.test(text)) {
      return { intent: intent.name, html: intent.reply(text) };
    }
  }

  // Nothing matched: friendly fallback
  return {
    intent: 'fallback',
    html: `Sorry, I did not understand that. Try asking about our <strong>menu, prices, deals, delivery, opening hours</strong> or <strong>table booking</strong>, or tap one of the questions below.<br>` +
      `You can also call us on ${RESTAURANT.phone}.`
  };
}

// =====================================================
//  Chat window (the floating button and the box)
// =====================================================
function initChatbot() {
  if (document.getElementById('chatToggle')) return;

  const holder = document.createElement('div');
  holder.innerHTML = `
    <button id="chatToggle" aria-label="Open chat assistant"><i class="bi bi-chat-dots-fill"></i></button>
    <div id="chatWindow" role="dialog" aria-label="Royal Feast chat assistant">
      <div class="chat-header">
        <div class="d-flex align-items-center gap-2">
          <span class="bot-avatar"><i class="bi bi-robot"></i></span>
          <div><strong>Royal Assistant</strong><br><small class="text-success">Online</small></div>
        </div>
        <button id="chatClose" aria-label="Close chat"><i class="bi bi-x-lg"></i></button>
      </div>
      <div class="chat-messages" id="chatMessages"></div>
      <div class="chat-chips" id="chatChips"></div>
      <form class="chat-input" id="chatForm" autocomplete="off">
        <input type="text" id="chatInput" class="form-control form-control-sm" placeholder="Type your question..." maxlength="200">
        <button type="submit" class="btn btn-gold btn-sm" aria-label="Send"><i class="bi bi-send-fill"></i></button>
      </form>
    </div>`;
  document.body.appendChild(holder);

  const chatWindow = document.getElementById('chatWindow');
  const messages = document.getElementById('chatMessages');
  const chips = document.getElementById('chatChips');
  const input = document.getElementById('chatInput');
  let showAll = false;
  let welcomed = false;

  function addMessage(html, who) {
    const bubble = document.createElement('div');
    bubble.className = 'msg ' + (who === 'user' ? 'msg-user' : 'msg-bot');
    bubble.innerHTML = html;
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
    return bubble;
  }

  function renderChips() {
    const list = showAll ? CHAT_QUESTIONS : CHAT_QUESTIONS.slice(0, 6);
    chips.innerHTML = list.map(q => `<button type="button" class="chip">${escapeHtml(q)}</button>`).join('') +
      `<button type="button" class="more-link" id="chipToggle">${showAll ? 'Show fewer' : 'More questions'}</button>`;
  }

  function sendMessage(text) {
    text = text.trim();
    if (!text) return;
    addMessage(escapeHtml(text), 'user');
    input.value = '';

    // Little "typing..." animation before the answer
    const typing = addMessage('<span class="typing-dots"><span></span><span></span><span></span></span>', 'bot');
    setTimeout(() => {
      typing.remove();
      addMessage(getBotReply(text).html, 'bot');
    }, 450);
  }

  function openChat() {
    chatWindow.classList.add('open');
    if (!welcomed) {
      welcomed = true;
      addMessage('Assalam-o-Alaikum! I am the <strong>Royal Feast assistant</strong>. Ask me anything about our menu, deals, delivery or bookings, or tap a question below.', 'bot');
    }
    input.focus();
  }

  document.getElementById('chatToggle').addEventListener('click', () => {
    chatWindow.classList.contains('open') ? chatWindow.classList.remove('open') : openChat();
  });
  document.getElementById('chatClose').addEventListener('click', () => chatWindow.classList.remove('open'));

  document.getElementById('chatForm').addEventListener('submit', event => {
    event.preventDefault();
    sendMessage(input.value);
  });

  chips.addEventListener('click', event => {
    if (event.target.id === 'chipToggle') {
      showAll = !showAll;
      renderChips();
      return;
    }
    const chip = event.target.closest('.chip');
    if (chip) sendMessage(chip.textContent);
  });

  renderChips();
}

if (typeof document !== 'undefined' && document.addEventListener) {
  document.addEventListener('DOMContentLoaded', initChatbot);
}
