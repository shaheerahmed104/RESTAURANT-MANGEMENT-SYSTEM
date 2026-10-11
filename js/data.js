/* =====================================================
   data.js  -  Shared data + helper functions
   Loaded on EVERY page before the other scripts.
   Everything is saved in the browser's localStorage.
   ===================================================== */

// ---------- localStorage keys ----------
const KEYS = {
  menu: 'rf_menu',
  cart: 'rf_cart',
  orders: 'rf_orders',
  reservations: 'rf_reservations',
  messages: 'rf_messages'
};

// ---------- Restaurant settings ----------
const RESTAURANT = {
  name: 'Royal Feast Restaurant',
  address: '24 Main Boulevard, Gulberg III, Lahore, Pakistan',
  phone: '+92 42 3555 0123',
  email: 'info@royalfeast.pk',
  hours: 'Every day, 12:00 PM - 12:00 AM'
};

// ---------- Billing rules ----------
const DELIVERY_FEE = 150;          // PKR, for delivery orders
const FREE_DELIVERY_OVER = 3000;   // delivery is free above this subtotal
const DISCOUNT_RATE = 0.10;        // 10% discount ...
const DISCOUNT_MIN = 2500;         // ... when subtotal reaches this amount

const ORDER_TYPES = ['Delivery', 'Takeaway', 'Dine-in'];
const PAYMENT_METHODS = ['Cash', 'Card', 'JazzCash', 'Easypaisa'];
const ORDER_STATUSES = ['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'];
const RESERVATION_STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
const CATEGORIES = ['Burgers', 'Pizza', 'BBQ & Grill', 'Mains', 'Pasta', 'Starters', 'Desserts', 'Drinks'];

// ---------- Images ----------
const unsplash = id => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=70`;

// Shown automatically if an image URL fails to load
const FALLBACK_IMG = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">' +
  '<rect width="100%" height="100%" fill="#3b2418"/>' +
  '<text x="50%" y="50%" fill="#d4a24c" font-family="Georgia" font-size="32" ' +
  'text-anchor="middle" dominant-baseline="middle">Royal Feast</text></svg>'
);

// ---------- Sample menu (26 dishes) ----------
const DEFAULT_MENU = [
  { id: 1, name: 'Classic Beef Burger', category: 'Burgers', price: 899, spicy: false, veg: false, popular: true,
    desc: 'Juicy beef patty, cheddar, lettuce, tomato and our house sauce in a toasted brioche bun.',
    ingredients: 'Beef patty, brioche bun, cheddar, lettuce, tomato, pickles, house sauce',
    img: unsplash('photo-1568901346375-23c9450c58cd') },
  { id: 2, name: 'Zinger Crunch Burger', category: 'Burgers', price: 799, spicy: true, veg: false, popular: true,
    desc: 'Crispy spiced chicken fillet with coleslaw and chilli mayo.',
    ingredients: 'Fried chicken fillet, bun, coleslaw, chilli mayo, lettuce',
    img: unsplash('photo-1550547660-d9450f859349') },
  { id: 3, name: 'Double Cheese Smash Burger', category: 'Burgers', price: 1199, spicy: false, veg: false, popular: false,
    desc: 'Two smashed beef patties, double cheese and caramelised onions.',
    ingredients: 'Two beef patties, American cheese, caramelised onions, bun, burger sauce',
    img: unsplash('photo-1571091718767-18b5b1457add') },
  { id: 4, name: 'Garden Veggie Burger', category: 'Burgers', price: 749, spicy: false, veg: true, popular: false,
    desc: 'Crispy vegetable and potato patty with fresh greens and garlic mayo.',
    ingredients: 'Vegetable patty, bun, lettuce, tomato, onion, garlic mayo',
    img: unsplash('photo-1520072959219-c595dc870360') },

  { id: 5, name: 'Chicken Tikka Pizza', category: 'Pizza', price: 1499, spicy: true, veg: false, popular: true,
    desc: 'Desi favourite topped with tandoori chicken tikka, onions and capsicum.',
    ingredients: 'Pizza dough, mozzarella, chicken tikka, onion, capsicum, tikka sauce',
    img: unsplash('photo-1513104890138-7c749659a591') },
  { id: 6, name: 'Margherita Pizza', category: 'Pizza', price: 1199, spicy: false, veg: true, popular: false,
    desc: 'Classic tomato sauce, fresh mozzarella and basil.',
    ingredients: 'Pizza dough, tomato sauce, mozzarella, fresh basil, olive oil',
    img: unsplash('photo-1574071318508-1cdbab80d002') },
  { id: 7, name: 'Pepperoni Feast Pizza', category: 'Pizza', price: 1699, spicy: false, veg: false, popular: false,
    desc: 'Loaded with beef pepperoni and extra mozzarella.',
    ingredients: 'Pizza dough, tomato sauce, mozzarella, beef pepperoni',
    img: unsplash('photo-1565299624946-b28f40a0ae38') },
  { id: 8, name: 'Fajita Sicilian Pizza', category: 'Pizza', price: 1599, spicy: true, veg: false, popular: false,
    desc: 'Thick crust pizza with fajita chicken, peppers and jalapenos.',
    ingredients: 'Thick dough, mozzarella, fajita chicken, bell peppers, jalapeno, onion',
    img: unsplash('photo-1604382354936-07c5d9983bd3') },

  { id: 9, name: 'Chicken Seekh Kebab Platter', category: 'BBQ & Grill', price: 1399, spicy: true, veg: false, popular: false,
    desc: 'Four charcoal-grilled seekh kebabs with mint chutney, salad and naan.',
    ingredients: 'Minced chicken, spices, green chilli, coriander, naan, mint chutney, salad',
    img: unsplash('photo-1555939594-58d7cb561ad1') },
  { id: 10, name: 'Beef Behari Boti', category: 'BBQ & Grill', price: 1599, spicy: true, veg: false, popular: true,
    desc: 'Tender smoky beef strips marinated overnight in traditional behari spices.',
    ingredients: 'Beef, raw papaya, yogurt, fried onion, cumin, coriander, red chilli',
    img: unsplash('photo-1529193591184-b1d58069ecdd') },
  { id: 11, name: 'Mutton Karahi (Half)', category: 'Mains', price: 2499, spicy: true, veg: false, popular: true,
    desc: 'Slow-cooked mutton karahi with tomatoes, ginger and green chillies.',
    ingredients: 'Mutton, tomato, ginger, garlic, green chilli, black pepper, coriander',
    img: unsplash('photo-1585937421612-70a008356fbe') },
  { id: 12, name: 'Grilled Chicken Tikka', category: 'BBQ & Grill', price: 1299, spicy: true, veg: false, popular: false,
    desc: 'Two chicken pieces grilled on charcoal, served with raita and naan.',
    ingredients: 'Chicken leg and breast, yogurt marinade, tikka masala, lemon, raita, naan',
    img: unsplash('photo-1432139555190-58524dae6a55') },

  { id: 13, name: 'Chicken Biryani', category: 'Mains', price: 899, spicy: true, veg: false, popular: true,
    desc: 'Fragrant long-grain basmati layered with spiced chicken and served with raita.',
    ingredients: 'Basmati rice, chicken, yogurt, fried onion, biryani masala, saffron, raita',
    img: unsplash('photo-1563379091339-03b21ab4a4f8') },
  { id: 14, name: 'Butter Chicken with Naan', category: 'Mains', price: 1399, spicy: false, veg: false, popular: false,
    desc: 'Creamy tomato-butter gravy with tender chicken and fresh naan.',
    ingredients: 'Chicken, butter, cream, tomato puree, fenugreek, garam masala, naan',
    img: unsplash('photo-1603894584373-5ac82b2ae398') },

  { id: 15, name: 'Creamy Alfredo Pasta', category: 'Pasta', price: 1099, spicy: false, veg: false, popular: false,
    desc: 'Fettuccine in a rich garlic parmesan cream sauce with grilled chicken.',
    ingredients: 'Fettuccine, cream, parmesan, garlic, butter, grilled chicken',
    img: unsplash('photo-1621996346565-e3dbc646d9a9') },
  { id: 16, name: 'Spicy Penne Arrabbiata', category: 'Pasta', price: 999, spicy: true, veg: true, popular: false,
    desc: 'Penne tossed in a fiery tomato and garlic sauce.',
    ingredients: 'Penne, tomato, garlic, chilli flakes, olive oil, basil',
    img: unsplash('photo-1473093295043-cdd812d0e601') },

  { id: 17, name: 'Crispy Chicken Wings', category: 'Starters', price: 799, spicy: true, veg: false, popular: false,
    desc: 'Six golden wings tossed in hot and spicy buffalo sauce.',
    ingredients: 'Chicken wings, flour coating, buffalo sauce, celery, dip',
    img: unsplash('photo-1567620832903-9fc6debc209f') },
  { id: 18, name: 'Loaded Cheese Fries', category: 'Starters', price: 599, spicy: false, veg: true, popular: false,
    desc: 'Crispy fries topped with melted cheese sauce and herbs.',
    ingredients: 'Potato fries, cheddar sauce, mozzarella, oregano',
    img: unsplash('photo-1573080496219-bb080dd4f877') },
  { id: 19, name: 'Garden Fresh Salad', category: 'Starters', price: 549, spicy: false, veg: true, popular: false,
    desc: 'Crisp greens, cherry tomatoes, cucumber and olives with lemon dressing.',
    ingredients: 'Lettuce, cherry tomato, cucumber, olives, lemon, olive oil',
    img: unsplash('photo-1512621776951-a57141f2eefd') },

  { id: 20, name: 'Chocolate Lava Cake', category: 'Desserts', price: 649, spicy: false, veg: true, popular: true,
    desc: 'Warm chocolate cake with a molten centre, served with vanilla ice cream.',
    ingredients: 'Dark chocolate, butter, eggs, flour, sugar, vanilla ice cream',
    img: unsplash('photo-1624353365286-3f8d62daad51') },
  { id: 21, name: 'Gulab Jamun (4 pcs)', category: 'Desserts', price: 399, spicy: false, veg: true, popular: false,
    desc: 'Soft milk dumplings soaked in rose-cardamom syrup.',
    ingredients: 'Milk solids, flour, sugar syrup, cardamom, rose water',
    img: unsplash('photo-1666190092159-3171cf0fbb12') },
  { id: 22, name: 'Kunafa with Cream', category: 'Desserts', price: 799, spicy: false, veg: true, popular: false,
    desc: 'Crispy shredded pastry layered with cream and sweet syrup.',
    ingredients: 'Kataifi pastry, cream, sugar syrup, pistachio, butter',
    img: unsplash('photo-1578985545062-69928b1d9587') },

  { id: 23, name: 'Fresh Mint Lemonade', category: 'Drinks', price: 349, spicy: false, veg: true, popular: false,
    desc: 'Chilled lemonade blended with fresh mint leaves.',
    ingredients: 'Lemon juice, mint, sugar, soda water, ice',
    img: unsplash('photo-1621263764928-df1444c5e859') },
  { id: 24, name: 'Sweet Mango Lassi', category: 'Drinks', price: 399, spicy: false, veg: true, popular: false,
    desc: 'Thick yogurt drink blended with ripe mango.',
    ingredients: 'Yogurt, mango pulp, sugar, cardamom',
    img: unsplash('photo-1553530666-ba11a7da3888') },
  { id: 25, name: 'Iced Cold Coffee', category: 'Drinks', price: 449, spicy: false, veg: true, popular: false,
    desc: 'Smooth cold coffee with milk and a scoop of ice cream.',
    ingredients: 'Coffee, milk, sugar, vanilla ice cream, ice',
    img: unsplash('photo-1461023058943-07fcbe16d735') },
  { id: 26, name: 'Soft Drink (500ml)', category: 'Drinks', price: 150, spicy: false, veg: true, popular: false,
    desc: 'Your choice of Pepsi, 7Up or Mirinda, served chilled.',
    ingredients: 'Carbonated soft drink',
    img: unsplash('photo-1544145945-f90425340c7e') }
];

// ---------- Deals and offers ----------
const DEALS = [
  { id: 'deal-1', name: 'Family Feast', tag: 'Family Deal', family: true, price: 4499, oldPrice: 5800,
    items: '2 Large Pizzas + Loaded Fries + 4 Soft Drinks',
    img: unsplash('photo-1513104890138-7c749659a591') },
  { id: 'deal-2', name: 'Burger Combo', tag: 'Combo', family: false, price: 1199, oldPrice: 1450,
    items: 'Zinger Burger + Fries + Soft Drink',
    img: unsplash('photo-1550547660-d9450f859349') },
  { id: 'deal-3', name: 'BBQ Night Platter', tag: 'Family Deal', family: true, price: 3299, oldPrice: 4100,
    items: 'Seekh Kebabs + Behari Boti + Chicken Tikka + 4 Naan + Raita',
    img: unsplash('photo-1555939594-58d7cb561ad1') },
  { id: 'deal-4', name: 'Student Special', tag: 'Combo', family: false, price: 799, oldPrice: 999,
    items: 'Chicken Biryani + Soft Drink (show your student card)',
    img: unsplash('photo-1563379091339-03b21ab4a4f8') },
  { id: 'deal-5', name: 'Date Night for Two', tag: 'Combo', family: false, price: 2999, oldPrice: 3700,
    items: '2 Pastas + Chocolate Lava Cake + 2 Mint Lemonades',
    img: unsplash('photo-1473093295043-cdd812d0e601') },
  { id: 'deal-6', name: 'Mega Party Box', tag: 'Family Deal', family: true, price: 7999, oldPrice: 10200,
    items: '3 Pizzas + 6 Wings + 2 Biryani + 8 Soft Drinks + 2 Desserts',
    img: unsplash('photo-1565299624946-b28f40a0ae38') }
];

// =====================================================
//  localStorage helpers
// =====================================================
function readData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// The menu is copied into localStorage on the first visit so the
// manager can later add / edit / delete items.
function getMenu() {
  const saved = readData(KEYS.menu, null);
  if (saved === null) {
    writeData(KEYS.menu, DEFAULT_MENU);
    return DEFAULT_MENU.slice();
  }
  return saved;
}
function saveMenu(menu) { writeData(KEYS.menu, menu); }

function getOrders() { return readData(KEYS.orders, []); }
function saveOrders(orders) { writeData(KEYS.orders, orders); }

function getReservations() { return readData(KEYS.reservations, []); }
function saveReservations(list) { writeData(KEYS.reservations, list); }

// =====================================================
//  Cart helpers
// =====================================================
function getCart() { return readData(KEYS.cart, []); }

function saveCart(cart) {
  writeData(KEYS.cart, cart);
  updateCartBadge();
}

// item = { id, name, price, img }
function addToCart(item) {
  const cart = getCart();
  const existing = cart.find(c => String(c.id) === String(item.id));
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: item.id, name: item.name, price: item.price, img: item.img, qty: 1 });
  }
  saveCart(cart);
}

function cartItemCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function updateCartBadge() {
  const count = cartItemCount();
  document.querySelectorAll('.cart-count').forEach(badge => {
    badge.textContent = count;
    badge.classList.toggle('d-none', count === 0);
  });
}

// Bill calculation used by the cart AND the checkout page
function calcBill(items, orderType) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = subtotal >= DISCOUNT_MIN ? Math.round(subtotal * DISCOUNT_RATE) : 0;
  const delivery = (orderType === 'Delivery' && subtotal > 0 && subtotal < FREE_DELIVERY_OVER) ? DELIVERY_FEE : 0;
  const total = subtotal - discount + delivery;
  return { subtotal, discount, delivery, total };
}

// =====================================================
//  General helpers
// =====================================================
function formatPKR(amount) {
  return 'PKR ' + Number(amount).toLocaleString('en-US');
}

function escapeHtml(text) {
  return String(text == null ? '' : text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function pad(n) { return String(n).padStart(2, '0'); }

// Local date as YYYY-MM-DD
function toDateKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function todayKey() { return toDateKey(new Date()); }

// Monday 00:00 of the week that contains `date`
function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

function isThisWeek(isoString) {
  const start = startOfWeek(new Date());
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  const d = new Date(isoString);
  return d >= start && d < end;
}

function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

// "2026-10-12" -> "12 Oct 2026"  (done by hand to avoid timezone shifts)
function formatDateKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// "19:30" -> "7:30 PM"
function formatTime(time24) {
  const [h, m] = time24.split(':').map(Number);
  return `${h % 12 || 12}:${pad(m)} ${h >= 12 ? 'PM' : 'AM'}`;
}

function generateOrderNumber() {
  const orders = getOrders();
  let number;
  do {
    number = 'RF-' + todayKey().replace(/-/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);
  } while (orders.some(o => o.orderNumber === number));
  return number;
}

function generateReservationId() {
  const list = getReservations();
  let id;
  do {
    id = 'RES-' + Math.floor(1000 + Math.random() * 9000);
  } while (list.some(r => r.id === id));
  return id;
}

// Accepts 03XXXXXXXXX, +923XXXXXXXXX, 923XXXXXXXXX (spaces / dashes allowed)
function isValidPhone(phone) {
  return /^(?:\+92|0092|92|0)?3\d{9}$/.test(phone.replace(/[\s-]/g, ''));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Adds the red / green Bootstrap validation style to an input
function markField(input, isValid) {
  input.classList.toggle('is-invalid', !isValid);
  input.classList.toggle('is-valid', isValid);
  return isValid;
}

// Small popup message (type = 'success' or 'error')
function showToast(message, type) {
  let box = document.getElementById('toastBox');
  if (!box) {
    box = document.createElement('div');
    box.id = 'toastBox';
    box.className = 'toast-container position-fixed top-0 end-0 p-3';
    document.body.appendChild(box);
  }
  const toast = document.createElement('div');
  toast.className = `toast align-items-center border-0 text-bg-${type === 'error' ? 'danger' : 'success'}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML =
    `<div class="d-flex"><div class="toast-body">${escapeHtml(message)}</div>` +
    '<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>';
  box.appendChild(toast);
  toast.addEventListener('hidden.bs.toast', () => toast.remove());
  new bootstrap.Toast(toast, { delay: 2800 }).show();
}

// HTML for one food card (used on Home and Menu pages)
function dishCardHTML(d) {
  return `
  <div class="col-sm-6 col-lg-4 col-xl-3 fade-in">
    <div class="dish-card h-100">
      <div class="dish-img-wrap">
        <img src="${escapeHtml(d.img)}" alt="${escapeHtml(d.name)}" loading="lazy"
             onerror="this.onerror=null;this.src=FALLBACK_IMG">
        <div class="dish-badges">
          ${d.popular ? '<span class="badge badge-gold">Popular</span>' : ''}
          ${d.spicy ? '<span class="badge bg-danger">Spicy</span>' : ''}
          ${d.veg ? '<span class="badge bg-success">Veg</span>' : ''}
        </div>
      </div>
      <div class="dish-body">
        <small class="dish-cat">${escapeHtml(d.category)}</small>
        <h5>${escapeHtml(d.name)}</h5>
        <p class="small text-cream-dim flex-grow-1">${escapeHtml(d.desc)}</p>
        <div class="d-flex justify-content-between align-items-center">
          <span class="price">${formatPKR(d.price)}</span>
          <button class="btn btn-gold btn-sm add-to-cart-btn" data-id="${d.id}">
            <i class="bi bi-cart-plus"></i> Add
          </button>
        </div>
      </div>
    </div>
  </div>`;
}

// HTML for one deal card (used on Home and Deals pages)
function dealCardHTML(deal) {
  const saving = deal.oldPrice - deal.price;
  return `
  <div class="col-md-6 col-lg-4 fade-in">
    <div class="deal-card h-100">
      <div class="deal-img">
        <img src="${escapeHtml(deal.img)}" alt="${escapeHtml(deal.name)}" loading="lazy"
             onerror="this.onerror=null;this.src=FALLBACK_IMG">
        <span class="deal-tag">${escapeHtml(deal.tag)}</span>
      </div>
      <div class="p-4">
        <h4 class="font-display">${escapeHtml(deal.name)}</h4>
        <p class="text-cream-dim small mb-3">${escapeHtml(deal.items)}</p>
        <div class="d-flex align-items-end justify-content-between">
          <div>
            <span class="old-price">${formatPKR(deal.oldPrice)}</span><br>
            <span class="price fs-4">${formatPKR(deal.price)}</span>
            <small class="text-success d-block">Save ${formatPKR(saving)}</small>
          </div>
          <button class="btn btn-gold add-deal-btn" data-id="${deal.id}">
            <i class="bi bi-cart-plus"></i> Add Deal
          </button>
        </div>
      </div>
    </div>
  </div>`;
}
