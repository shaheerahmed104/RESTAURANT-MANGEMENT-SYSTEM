/* =====================================================
   cart.js  -  Cart page: show items, change quantity,
   remove items and calculate the bill
   ===================================================== */

const cartItemsBox = document.getElementById('cartItems');
const cartEmpty = document.getElementById('cartEmpty');
const cartContent = document.getElementById('cartContent');

function renderCart() {
  const cart = getCart();

  // Empty cart -> show the friendly message
  cartEmpty.classList.toggle('d-none', cart.length > 0);
  cartContent.classList.toggle('d-none', cart.length === 0);
  if (cart.length === 0) return;

  cartItemsBox.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${escapeHtml(item.img)}" alt="${escapeHtml(item.name)}" onerror="this.onerror=null;this.src=FALLBACK_IMG">
      <div class="item-info">
        <h6 class="mb-1">${escapeHtml(item.name)}</h6>
        <small class="text-cream-dim">${formatPKR(item.price)} each</small>
      </div>
      <div class="qty-control">
        <button data-action="decrease" data-id="${escapeHtml(item.id)}" aria-label="Decrease quantity"><i class="bi bi-dash-lg"></i></button>
        <span>${item.qty}</span>
        <button data-action="increase" data-id="${escapeHtml(item.id)}" aria-label="Increase quantity"><i class="bi bi-plus-lg"></i></button>
      </div>
      <div class="item-total text-end" style="min-width:110px">
        <strong class="price">${formatPKR(item.price * item.qty)}</strong>
      </div>
      <button class="btn btn-sm btn-outline-danger" data-action="remove" data-id="${escapeHtml(item.id)}" aria-label="Remove item">
        <i class="bi bi-trash3"></i>
      </button>
    </div>`).join('');

  // Cart page assumes a delivery order; the checkout page recalculates by order type
  const bill = calcBill(cart, 'Delivery');
  document.getElementById('subtotal').textContent = formatPKR(bill.subtotal);
  document.getElementById('discount').textContent = '- ' + formatPKR(bill.discount);
  document.getElementById('delivery').textContent = bill.delivery === 0 ? 'FREE' : formatPKR(bill.delivery);
  document.getElementById('total').textContent = formatPKR(bill.total);

  // Helpful hints
  const discountNote = document.getElementById('discountNote');
  discountNote.textContent = bill.discount > 0
    ? `You got a ${DISCOUNT_RATE * 100}% discount!`
    : `Add ${formatPKR(DISCOUNT_MIN - bill.subtotal)} more to get ${DISCOUNT_RATE * 100}% off.`;
  const deliveryNote = document.getElementById('deliveryNote');
  deliveryNote.textContent = bill.delivery === 0
    ? 'You qualify for free delivery.'
    : `Delivery is ${formatPKR(DELIVERY_FEE)} (free above ${formatPKR(FREE_DELIVERY_OVER)}). Takeaway and dine-in have no delivery charge.`;
}

// One listener handles +, - and remove buttons
cartItemsBox.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  let cart = getCart();
  const item = cart.find(c => String(c.id) === button.dataset.id);
  if (!item) return;

  if (button.dataset.action === 'increase') item.qty += 1;
  if (button.dataset.action === 'decrease') item.qty = Math.max(1, item.qty - 1);
  if (button.dataset.action === 'remove') {
    cart = cart.filter(c => c !== item);
    showToast(`${item.name} removed from cart`, 'success');
  }

  saveCart(cart);
  renderCart();
});

document.getElementById('clearCartBtn').addEventListener('click', () => {
  if (confirm('Remove all items from your cart?')) {
    saveCart([]);
    renderCart();
  }
});

renderCart();
