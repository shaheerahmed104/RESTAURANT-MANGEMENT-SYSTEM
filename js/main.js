/* =====================================================
   main.js  -  Runs on every page
   - builds the navbar and footer
   - handles every "Add to Cart" button
   - fills the Home and Deals pages
   - handles the Contact form
   ===================================================== */

const NAV_LINKS = [
  ['index.html', 'Home'],
  ['menu.html', 'Menu'],
  ['deals.html', 'Deals'],
  ['booking.html', 'Book a Table'],
  ['about.html', 'About'],
  ['contact.html', 'Contact']
];

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
  renderFooter();
  updateCartBadge();
  initScrollReveal();
  renderHomePage();
  renderDealsPage();
  initContactForm();
});

// ---------- Navbar ----------
function renderNavbar() {
  const holder = document.getElementById('navbar');
  if (!holder) return;
  const current = location.pathname.split('/').pop() || 'index.html';

  const links = NAV_LINKS.map(([href, label]) =>
    `<li class="nav-item"><a class="nav-link ${href === current ? 'active' : ''}" href="${href}">${label}</a></li>`
  ).join('');

  holder.innerHTML = `
  <nav class="navbar navbar-expand-lg navbar-royal sticky-top">
    <div class="container">
      <a class="navbar-brand" href="index.html"><i class="bi bi-gem"></i> Royal <span>Feast</span></a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav"
              aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="mainNav">
        <ul class="navbar-nav mx-auto mb-2 mb-lg-0">${links}</ul>
        <div class="d-flex align-items-center gap-2">
          <a href="cart.html" class="btn btn-outline-gold position-relative">
            <i class="bi bi-cart3"></i> Cart
            <span class="cart-count badge rounded-pill d-none">0</span>
          </a>
          <a href="admin.html" class="btn btn-gold"><i class="bi bi-speedometer2"></i> Manager</a>
        </div>
      </div>
    </div>
  </nav>`;
}

// ---------- Footer ----------
function renderFooter() {
  const holder = document.getElementById('footer');
  if (!holder) return;
  holder.innerHTML = `
  <footer class="site-footer">
    <div class="container">
      <div class="row g-4">
        <div class="col-lg-4">
          <h4 class="font-display text-gold"><i class="bi bi-gem"></i> Royal Feast</h4>
          <p class="text-cream-dim">Fine dining flavours, family-friendly prices. Dine in, take away or enjoy delivery at your door.</p>
          <div class="social-links">
            <a href="#" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
            <a href="#" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
            <a href="#" aria-label="WhatsApp"><i class="bi bi-whatsapp"></i></a>
          </div>
        </div>
        <div class="col-6 col-lg-2">
          <h6 class="text-gold">Quick Links</h6>
          <ul class="list-unstyled footer-links">
            <li><a href="menu.html">Menu</a></li>
            <li><a href="deals.html">Deals</a></li>
            <li><a href="booking.html">Book a Table</a></li>
            <li><a href="cart.html">Cart</a></li>
            <li><a href="admin.html">Manager Dashboard</a></li>
          </ul>
        </div>
        <div class="col-6 col-lg-2">
          <h6 class="text-gold">Company</h6>
          <ul class="list-unstyled footer-links">
            <li><a href="about.html">About Us</a></li>
            <li><a href="contact.html">Contact</a></li>
            <li><a href="checkout.html">Checkout</a></li>
          </ul>
        </div>
        <div class="col-lg-4">
          <h6 class="text-gold">Visit Us</h6>
          <p class="text-cream-dim mb-1"><i class="bi bi-geo-alt-fill text-gold"></i> ${RESTAURANT.address}</p>
          <p class="text-cream-dim mb-1"><i class="bi bi-telephone-fill text-gold"></i> ${RESTAURANT.phone}</p>
          <p class="text-cream-dim mb-1"><i class="bi bi-envelope-fill text-gold"></i> ${RESTAURANT.email}</p>
          <p class="text-cream-dim mb-0"><i class="bi bi-clock-fill text-gold"></i> ${RESTAURANT.hours}</p>
        </div>
      </div>
      <hr class="footer-line">
      <p class="text-center text-cream-dim small mb-0">&copy; ${new Date().getFullYear()} Royal Feast Restaurant. University project - all data is stored in your browser only.</p>
    </div>
  </footer>`;
}

// ---------- Fade-in on scroll for elements with class "reveal" ----------
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach(el => observer.observe(el));
}

// ---------- Add to Cart buttons (work on every page) ----------
document.addEventListener('click', event => {
  const dishButton = event.target.closest('.add-to-cart-btn');
  if (dishButton) {
    const dish = getMenu().find(d => String(d.id) === dishButton.dataset.id);
    if (dish) {
      addToCart(dish);
      showToast(`${dish.name} added to cart`, 'success');
    }
    return;
  }
  const dealButton = event.target.closest('.add-deal-btn');
  if (dealButton) {
    const deal = DEALS.find(d => d.id === dealButton.dataset.id);
    if (deal) {
      addToCart(deal);
      showToast(`${deal.name} added to cart`, 'success');
    }
  }
});

// ---------- Home page ----------
function renderHomePage() {
  const popularBox = document.getElementById('popularDishes');
  if (popularBox) {
    const menu = getMenu();
    let popular = menu.filter(d => d.popular).slice(0, 4);
    if (popular.length === 0) popular = menu.slice(0, 4);
    popularBox.innerHTML = popular.length
      ? popular.map(dishCardHTML).join('')
      : '<p class="text-center text-cream-dim">The menu is empty right now.</p>';
  }

  const offersBox = document.getElementById('homeOffers');
  if (offersBox) {
    offersBox.innerHTML = DEALS.slice(0, 3).map(dealCardHTML).join('');
  }
}

// ---------- Deals page ----------
function renderDealsPage() {
  const dealsBox = document.getElementById('dealsContainer');
  if (dealsBox) {
    dealsBox.innerHTML = DEALS.map(dealCardHTML).join('');
  }

  const offerInfo = document.getElementById('offerInfo');
  if (offerInfo) {
    const offers = [
      ['bi-percent', `${DISCOUNT_RATE * 100}% Off`, `Automatic ${DISCOUNT_RATE * 100}% discount when your order is ${formatPKR(DISCOUNT_MIN)} or more.`],
      ['bi-truck', 'Free Delivery', `No delivery charge on orders above ${formatPKR(FREE_DELIVERY_OVER)}. Otherwise just ${formatPKR(DELIVERY_FEE)}.`],
      ['bi-people-fill', 'Family Deals', 'Feed the whole family with our big pizza, BBQ and party boxes.'],
      ['bi-mortarboard-fill', 'Student Special', 'Show your student card and enjoy biryani with a drink for only PKR 799.']
    ];
    offerInfo.innerHTML = offers.map(([icon, title, text]) => `
      <div class="col-sm-6 col-lg-3">
        <div class="info-box h-100">
          <i class="bi ${icon}"></i>
          <h5>${title}</h5>
          <p class="text-cream-dim small mb-0">${text}</p>
        </div>
      </div>`).join('');
  }
}

// ---------- Contact form ----------
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', event => {
    event.preventDefault();
    const name = document.getElementById('cName');
    const email = document.getElementById('cEmail');
    const subject = document.getElementById('cSubject');
    const message = document.getElementById('cMessage');

    // Validate every field (the & operator makes sure all fields get marked)
    const ok =
      markField(name, name.value.trim().length >= 2) &
      markField(email, isValidEmail(email.value.trim())) &
      markField(message, message.value.trim().length >= 10);

    if (!ok) {
      showToast('Please fix the highlighted fields.', 'error');
      return;
    }

    const messages = readData(KEYS.messages, []);
    messages.push({
      name: name.value.trim(),
      email: email.value.trim(),
      subject: subject.value.trim(),
      message: message.value.trim(),
      createdAt: new Date().toISOString()
    });
    writeData(KEYS.messages, messages);

    form.reset();
    form.querySelectorAll('.is-valid').forEach(el => el.classList.remove('is-valid'));
    showToast('Thank you! Your message has been sent.', 'success');
  });
}
