/* =====================================================
   checkout.js  -  Validate the form, save the order
   in localStorage and show the confirmation
   ===================================================== */

const checkoutForm = document.getElementById('checkoutForm');
const custName = document.getElementById('custName');
const custPhone = document.getElementById('custPhone');
const custAddress = document.getElementById('custAddress');
const custNotes = document.getElementById('custNotes');
const addressBox = document.getElementById('addressBox');

// Draw the radio buttons for order type and payment method
function renderRadioGroup(containerId, name, options) {
  document.getElementById(containerId).innerHTML = options.map((option, index) => `
    <div class="form-check">
      <input class="form-check-input" type="radio" name="${name}" id="${name}${index}" value="${option}" ${index === 0 ? 'checked' : ''}>
      <label class="form-check-label" for="${name}${index}">${option}</label>
    </div>`).join('');
}
renderRadioGroup('orderTypeGroup', 'orderType', ORDER_TYPES);
renderRadioGroup('paymentGroup', 'payment', PAYMENT_METHODS);

function selectedValue(name) {
  return document.querySelector(`input[name="${name}"]:checked`).value;
}

// Show the cart items and bill on the right side
function renderCheckoutSummary() {
  const cart = getCart();
  const orderType = selectedValue('orderType');
  const bill = calcBill(cart, orderType);

  document.getElementById('checkoutItems').innerHTML = cart.map(item => `
    <div class="summary-row small">
      <span>${escapeHtml(item.name)} &times; ${item.qty}</span>
      <span>${formatPKR(item.price * item.qty)}</span>
    </div>`).join('');
  document.getElementById('coSubtotal').textContent = formatPKR(bill.subtotal);
  document.getElementById('coDiscount').textContent = '- ' + formatPKR(bill.discount);
  document.getElementById('coDelivery').textContent = bill.delivery === 0 ? (orderType === 'Delivery' ? 'FREE' : 'PKR 0') : formatPKR(bill.delivery);
  document.getElementById('coTotal').textContent = formatPKR(bill.total);

  // The address is only needed for delivery orders
  addressBox.classList.toggle('d-none', orderType !== 'Delivery');
}

function initCheckoutPage() {
  const hasItems = getCart().length > 0;
  document.getElementById('checkoutEmpty').classList.toggle('d-none', hasItems);
  document.getElementById('checkoutContent').classList.toggle('d-none', !hasItems);
  if (hasItems) renderCheckoutSummary();
}

// Recalculate when the order type changes
document.getElementById('orderTypeGroup').addEventListener('change', renderCheckoutSummary);

checkoutForm.addEventListener('submit', event => {
  event.preventDefault();

  const orderType = selectedValue('orderType');
  const needsAddress = orderType === 'Delivery';

  // Validate - each markField call colours its field red or green
  const ok =
    markField(custName, custName.value.trim().length >= 2) &
    markField(custPhone, isValidPhone(custPhone.value)) &
    (needsAddress ? markField(custAddress, custAddress.value.trim().length >= 10) : 1);

  if (!ok) {
    showToast('Please fix the highlighted fields.', 'error');
    return;
  }

  const cart = getCart();
  if (cart.length === 0) {
    showToast('Your cart is empty.', 'error');
    return;
  }

  const bill = calcBill(cart, orderType);
  const order = {
    orderNumber: generateOrderNumber(),
    customerName: custName.value.trim(),
    phone: custPhone.value.trim(),
    address: needsAddress ? custAddress.value.trim() : '-',
    orderType: orderType,
    paymentMethod: selectedValue('payment'),
    notes: custNotes.value.trim(),
    items: cart.map(item => ({ name: item.name, price: item.price, qty: item.qty })),
    subtotal: bill.subtotal,
    discount: bill.discount,
    delivery: bill.delivery,
    total: bill.total,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  // Save the order, then empty the cart
  const orders = getOrders();
  orders.push(order);
  saveOrders(orders);
  saveCart([]);

  showConfirmation(order);
});

function showConfirmation(order) {
  document.getElementById('checkoutContent').classList.add('d-none');
  document.getElementById('confirmation').classList.remove('d-none');
  document.getElementById('confName').textContent = order.customerName;
  document.getElementById('confNumber').textContent = order.orderNumber;
  document.getElementById('confDetails').innerHTML = `
    <div class="summary-row"><span>Order type</span><span>${escapeHtml(order.orderType)}</span></div>
    <div class="summary-row"><span>Payment</span><span>${escapeHtml(order.paymentMethod)}</span></div>
    <div class="summary-row"><span>Items</span><span>${order.items.reduce((s, i) => s + i.qty, 0)}</span></div>
    <div class="summary-row summary-total"><span>Total paid / due</span><span>${formatPKR(order.total)}</span></div>`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  showToast('Order placed successfully!', 'success');
}

initCheckoutPage();
