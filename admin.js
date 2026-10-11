/* =====================================================
   admin.js  -  Manager dashboard
   Every number on this page is calculated from the
   records saved in localStorage (orders, reservations, menu).
   ===================================================== */

const DEFAULT_DISH_IMG = unsplash('photo-1504674900247-0877df9cc836');

const STATUS_BADGE = {
  Pending: 'bg-warning text-dark',
  Preparing: 'bg-info text-dark',
  Ready: 'bg-primary',
  Completed: 'bg-success',
  Cancelled: 'bg-danger',
  Confirmed: 'bg-info text-dark'
};

const orderModal = new bootstrap.Modal(document.getElementById('orderModal'));
const menuModal = new bootstrap.Modal(document.getElementById('menuModal'));
let salesChart = null;

// ---------- Small helpers ----------
function statusBadge(status) {
  return `<span class="badge ${STATUS_BADGE[status] || 'bg-secondary'}">${escapeHtml(status)}</span>`;
}

// A <select> used to change a status
function statusSelect(options, current, cssClass, id) {
  return `<select class="form-select form-select-sm ${cssClass}" data-id="${escapeHtml(id)}" style="min-width:125px">` +
    options.map(s => `<option value="${s}" ${s === current ? 'selected' : ''}>${s}</option>`).join('') +
    '</select>';
}

function emptyRow(columns, message) {
  return `<tr><td colspan="${columns}" class="empty-note">${message}</td></tr>`;
}

function sumTotals(orders) {
  return orders.reduce((sum, o) => sum + o.total, 0);
}

function newestFirst(list) {
  return list.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// =====================================================
//  1. Statistic cards
// =====================================================
function renderStats() {
  const orders = getOrders();
  const reservations = getReservations();
  const countedSales = orders.filter(o => o.status !== 'Cancelled');   // cancelled orders are not sales

  document.getElementById('statTotalOrders').textContent = orders.length;
  document.getElementById('statToday').textContent = orders.filter(o => toDateKey(o.createdAt) === todayKey()).length;
  document.getElementById('statWeek').textContent = orders.filter(o => isThisWeek(o.createdAt)).length;
  document.getElementById('statSales').textContent = formatPKR(sumTotals(countedSales));
  document.getElementById('statPending').textContent = orders.filter(o => o.status === 'Pending').length;
  document.getElementById('statCompleted').textContent = orders.filter(o => o.status === 'Completed').length;
  document.getElementById('statReservations').textContent = reservations.length;
  document.getElementById('statMenuItems').textContent = getMenu().length;
}

// =====================================================
//  2. Sales chart (Chart.js)
// =====================================================
function buildChartData(mode) {
  const valid = getOrders().filter(o => o.status !== 'Cancelled');
  const labels = [];
  const values = [];

  if (mode === 'daily') {
    // last 7 days, today included
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const key = toDateKey(day);
      labels.push(day.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }));
      values.push(sumTotals(valid.filter(o => toDateKey(o.createdAt) === key)));
    }
  } else {
    // last 4 weeks (weeks start on Monday)
    const thisMonday = startOfWeek(new Date());
    for (let i = 3; i >= 0; i--) {
      const start = new Date(thisMonday);
      start.setDate(start.getDate() - 7 * i);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      labels.push('Week of ' + start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }));
      values.push(sumTotals(valid.filter(o => {
        const t = new Date(o.createdAt);
        return t >= start && t < end;
      })));
    }
  }
  return { labels, values };
}

function renderChart() {
  const canvas = document.getElementById('salesChart');
  if (typeof Chart === 'undefined') {
    canvas.parentElement.innerHTML = '<p class="empty-note">Chart.js could not be loaded. Check your internet connection.</p>';
    return;
  }
  const { labels, values } = buildChartData(document.getElementById('chartMode').value);

  if (salesChart) salesChart.destroy();
  Chart.defaults.color = '#cdbfa6';
  salesChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Sales (PKR)',
        data: values,
        backgroundColor: 'rgba(212, 162, 76, 0.75)',
        borderColor: '#d4a24c',
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(212,162,76,0.15)' }, ticks: { callback: v => 'PKR ' + v.toLocaleString('en-US') } },
        x: { grid: { display: false } }
      }
    }
  });
}

// =====================================================
//  3. Overview tables
// =====================================================
function renderRecentOrders() {
  const recent = newestFirst(getOrders()).slice(0, 5);
  document.getElementById('recentOrders').innerHTML = recent.length
    ? recent.map(o => `
      <tr>
        <td><a href="#" class="view-order-btn" data-id="${escapeHtml(o.orderNumber)}">${escapeHtml(o.orderNumber)}</a></td>
        <td>${escapeHtml(o.customerName)}</td>
        <td>${formatPKR(o.total)}</td>
        <td>${statusSelect(ORDER_STATUSES, o.status, 'order-status-select', o.orderNumber)}</td>
      </tr>`).join('')
    : emptyRow(4, 'No orders yet. Place one from the menu, or click "Load Sample Data".');
}

function renderRecentReservations() {
  const recent = newestFirst(getReservations()).slice(0, 5);
  document.getElementById('recentReservations').innerHTML = recent.length
    ? recent.map(r => `
      <tr>
        <td>${escapeHtml(r.name)}</td>
        <td>${formatDateKey(r.date)}<br><small class="text-cream-dim">${formatTime(r.time)}</small></td>
        <td>${r.guests}</td>
        <td>${statusBadge(r.status)}</td>
      </tr>`).join('')
    : emptyRow(4, 'No reservations yet.');
}

// =====================================================
//  4. Orders tab
// =====================================================
function renderOrdersTable() {
  const filter = document.getElementById('orderFilter').value;
  let orders = newestFirst(getOrders());
  if (filter !== 'All') orders = orders.filter(o => o.status === filter);

  document.getElementById('ordersTable').innerHTML = orders.length
    ? orders.map(o => `
      <tr>
        <td><strong>${escapeHtml(o.orderNumber)}</strong></td>
        <td>${formatDateTime(o.createdAt)}</td>
        <td>${escapeHtml(o.customerName)}<br><small class="text-cream-dim">${escapeHtml(o.phone)}</small></td>
        <td>${escapeHtml(o.orderType)}</td>
        <td>${formatPKR(o.total)}</td>
        <td>${statusSelect(ORDER_STATUSES, o.status, 'order-status-select', o.orderNumber)}</td>
        <td><button class="btn btn-sm btn-outline-gold view-order-btn" data-id="${escapeHtml(o.orderNumber)}"><i class="bi bi-eye"></i></button></td>
      </tr>`).join('')
    : emptyRow(7, 'No orders to show.');
}

function showOrderDetails(orderNumber) {
  const order = getOrders().find(o => o.orderNumber === orderNumber);
  if (!order) return;
  document.getElementById('orderModalTitle').textContent = order.orderNumber;
  document.getElementById('orderModalBody').innerHTML = `
    <p class="mb-1"><strong>${escapeHtml(order.customerName)}</strong> - ${escapeHtml(order.phone)}</p>
    <p class="mb-1 small text-cream-dim">${formatDateTime(order.createdAt)} | ${escapeHtml(order.orderType)} | ${escapeHtml(order.paymentMethod)}</p>
    <p class="mb-1 small">Address: ${escapeHtml(order.address)}</p>
    <p class="small">Notes: ${order.notes ? escapeHtml(order.notes) : '-'}</p>
    <table class="table table-sm">
      <thead><tr><th>Item</th><th>Qty</th><th class="text-end">Amount</th></tr></thead>
      <tbody>${order.items.map(i => `<tr><td>${escapeHtml(i.name)}</td><td>${i.qty}</td><td class="text-end">${formatPKR(i.price * i.qty)}</td></tr>`).join('')}</tbody>
    </table>
    <div class="summary-row"><span>Subtotal</span><span>${formatPKR(order.subtotal)}</span></div>
    <div class="summary-row"><span>Discount</span><span>- ${formatPKR(order.discount)}</span></div>
    <div class="summary-row"><span>Delivery</span><span>${formatPKR(order.delivery)}</span></div>
    <div class="summary-row summary-total"><span>Total</span><span>${formatPKR(order.total)}</span></div>
    <p class="mt-3 mb-0">Status: ${statusBadge(order.status)}</p>`;
  orderModal.show();
}

// =====================================================
//  5. Menu tab (add / edit / delete)
// =====================================================
function renderMenuTable() {
  const menu = getMenu();
  document.getElementById('menuTable').innerHTML = menu.length
    ? menu.map(d => `
      <tr>
        <td><img class="menu-thumb" src="${escapeHtml(d.img)}" alt="" onerror="this.onerror=null;this.src=FALLBACK_IMG"></td>
        <td><strong>${escapeHtml(d.name)}</strong></td>
        <td>${escapeHtml(d.category)}</td>
        <td>${formatPKR(d.price)}</td>
        <td>
          ${d.popular ? '<span class="badge badge-gold">Popular</span>' : ''}
          ${d.spicy ? '<span class="badge bg-danger">Spicy</span>' : ''}
          ${d.veg ? '<span class="badge bg-success">Veg</span>' : ''}
        </td>
        <td class="text-end text-nowrap">
          <button class="btn btn-sm btn-outline-gold edit-menu-btn" data-id="${d.id}" aria-label="Edit"><i class="bi bi-pencil-square"></i></button>
          <button class="btn btn-sm btn-outline-danger delete-menu-btn" data-id="${d.id}" aria-label="Delete"><i class="bi bi-trash3"></i></button>
        </td>
      </tr>`).join('')
    : emptyRow(6, 'The menu is empty. Click "Add New Dish" to create one.');
}

const menuForm = document.getElementById('menuForm');
const miName = document.getElementById('miName');
const miCategory = document.getElementById('miCategory');
const miPrice = document.getElementById('miPrice');
const miDesc = document.getElementById('miDesc');

function fillCategorySelect(selected) {
  const all = [...new Set([...CATEGORIES, ...getMenu().map(d => d.category)])];
  miCategory.innerHTML = all.map(c => `<option value="${escapeHtml(c)}" ${c === selected ? 'selected' : ''}>${escapeHtml(c)}</option>`).join('');
}

function openMenuForm(dish) {
  menuForm.reset();
  menuForm.querySelectorAll('.is-valid, .is-invalid').forEach(el => el.classList.remove('is-valid', 'is-invalid'));
  fillCategorySelect(dish ? dish.category : CATEGORIES[0]);

  document.getElementById('menuModalTitle').textContent = dish ? 'Edit Dish' : 'Add Dish';
  document.getElementById('miId').value = dish ? dish.id : '';
  if (dish) {
    miName.value = dish.name;
    miPrice.value = dish.price;
    miDesc.value = dish.desc;
    document.getElementById('miIngredients').value = dish.ingredients || '';
    document.getElementById('miImg').value = dish.img || '';
    document.getElementById('miSpicy').checked = !!dish.spicy;
    document.getElementById('miVeg').checked = !!dish.veg;
    document.getElementById('miPopular').checked = !!dish.popular;
  }
  menuModal.show();
}

menuForm.addEventListener('submit', event => {
  event.preventDefault();

  const ok =
    markField(miName, miName.value.trim().length >= 2) &
    markField(miPrice, Number(miPrice.value) > 0) &
    markField(miDesc, miDesc.value.trim().length >= 5);
  if (!ok) {
    showToast('Please fix the highlighted fields.', 'error');
    return;
  }

  const data = {
    name: miName.value.trim(),
    category: miCategory.value,
    price: Math.round(Number(miPrice.value)),
    desc: miDesc.value.trim(),
    ingredients: document.getElementById('miIngredients').value.trim(),
    img: document.getElementById('miImg').value.trim() || DEFAULT_DISH_IMG,
    spicy: document.getElementById('miSpicy').checked,
    veg: document.getElementById('miVeg').checked,
    popular: document.getElementById('miPopular').checked
  };

  const menu = getMenu();
  const editingId = document.getElementById('miId').value;
  if (editingId) {
    const index = menu.findIndex(d => String(d.id) === editingId);
    if (index !== -1) menu[index] = { ...menu[index], ...data };
    showToast('Dish updated.', 'success');
  } else {
    const newId = menu.reduce((max, d) => Math.max(max, Number(d.id) || 0), 0) + 1;
    menu.push({ id: newId, ...data });
    showToast('Dish added to the menu.', 'success');
  }
  saveMenu(menu);
  menuModal.hide();
  renderAll();
});

// =====================================================
//  6. Reservations tab
// =====================================================
function renderReservationsTable() {
  const list = getReservations().slice().sort((a, b) =>
    (a.date + a.time).localeCompare(b.date + b.time));

  document.getElementById('reservationsTable').innerHTML = list.length
    ? list.map(r => `
      <tr>
        <td><strong>${escapeHtml(r.id)}</strong></td>
        <td>${escapeHtml(r.name)}</td>
        <td>${escapeHtml(r.phone)}</td>
        <td>${formatDateKey(r.date)}</td>
        <td>${formatTime(r.time)}</td>
        <td>${r.guests}</td>
        <td class="small">${r.notes ? escapeHtml(r.notes) : '-'}</td>
        <td>${statusSelect(RESERVATION_STATUSES, r.status, 'reservation-status-select', r.id)}</td>
        <td><button class="btn btn-sm btn-outline-danger delete-reservation-btn" data-id="${escapeHtml(r.id)}" aria-label="Delete"><i class="bi bi-trash3"></i></button></td>
      </tr>`).join('')
    : emptyRow(9, 'No reservations yet.');
}

// =====================================================
//  Draw everything
// =====================================================
function renderAll() {
  renderStats();
  renderChart();
  renderRecentOrders();
  renderRecentReservations();
  renderOrdersTable();
  renderMenuTable();
  renderReservationsTable();
}

// =====================================================
//  Events (one listener per type, using event delegation)
// =====================================================
document.addEventListener('change', event => {
  const target = event.target;

  if (target.classList.contains('order-status-select')) {
    const orders = getOrders();
    const order = orders.find(o => o.orderNumber === target.dataset.id);
    if (order) {
      order.status = target.value;
      saveOrders(orders);
      showToast(`${order.orderNumber} is now ${order.status}`, 'success');
      renderAll();
    }
  }

  if (target.classList.contains('reservation-status-select')) {
    const list = getReservations();
    const reservation = list.find(r => r.id === target.dataset.id);
    if (reservation) {
      reservation.status = target.value;
      saveReservations(list);
      showToast(`${reservation.id} is now ${reservation.status}`, 'success');
      renderAll();
    }
  }
});

document.addEventListener('click', event => {
  const viewBtn = event.target.closest('.view-order-btn');
  if (viewBtn) {
    event.preventDefault();
    showOrderDetails(viewBtn.dataset.id);
    return;
  }

  const editBtn = event.target.closest('.edit-menu-btn');
  if (editBtn) {
    const dish = getMenu().find(d => String(d.id) === editBtn.dataset.id);
    if (dish) openMenuForm(dish);
    return;
  }

  const deleteMenuBtn = event.target.closest('.delete-menu-btn');
  if (deleteMenuBtn) {
    const dish = getMenu().find(d => String(d.id) === deleteMenuBtn.dataset.id);
    if (dish && confirm(`Delete "${dish.name}" from the menu?`)) {
      saveMenu(getMenu().filter(d => d !== dish && String(d.id) !== String(dish.id)));
      showToast('Dish deleted.', 'success');
      renderAll();
    }
    return;
  }

  const deleteResBtn = event.target.closest('.delete-reservation-btn');
  if (deleteResBtn && confirm('Delete this reservation?')) {
    saveReservations(getReservations().filter(r => r.id !== deleteResBtn.dataset.id));
    showToast('Reservation deleted.', 'success');
    renderAll();
  }
});

document.getElementById('addMenuBtn').addEventListener('click', () => openMenuForm(null));
document.getElementById('chartMode').addEventListener('change', renderChart);
document.getElementById('orderFilter').addEventListener('change', renderOrdersTable);

// Fill the order status filter
document.getElementById('orderFilter').innerHTML =
  '<option value="All">All statuses</option>' + ORDER_STATUSES.map(s => `<option value="${s}">${s}</option>`).join('');

// =====================================================
//  Demo tools: sample data and reset
// =====================================================
function randomItem(list) { return list[Math.floor(Math.random() * list.length)]; }

function loadSampleData() {
  const menu = getMenu();
  if (menu.length === 0) {
    showToast('Add some dishes to the menu first.', 'error');
    return;
  }
  if (!confirm('Add sample orders and reservations for demonstration? Your existing data is kept.')) return;

  const names = ['Ali Khan', 'Sara Ahmed', 'Usman Tariq', 'Hina Malik', 'Bilal Hussain', 'Maryam Iqbal', 'Zain Abbas', 'Fatima Noor'];
  const orders = getOrders();

  for (let i = 0; i < 16; i++) {
    const daysAgo = Math.floor(Math.random() * 10);           // 0 to 9 days ago
    const when = new Date();
    when.setDate(when.getDate() - daysAgo);
    when.setHours(12 + Math.floor(Math.random() * 11), Math.floor(Math.random() * 60));
    if (when > new Date()) when.setTime(Date.now() - 600000);  // never in the future

    // 1 to 4 different dishes, 1 to 3 of each
    const items = [];
    const howMany = 1 + Math.floor(Math.random() * 4);
    for (let j = 0; j < howMany; j++) {
      const dish = randomItem(menu);
      if (!items.some(it => it.name === dish.name)) {
        items.push({ name: dish.name, price: dish.price, qty: 1 + Math.floor(Math.random() * 3) });
      }
    }

    const orderType = randomItem(ORDER_TYPES);
    const bill = calcBill(items, orderType);
    let status;
    if (daysAgo > 0) status = Math.random() < 0.1 ? 'Cancelled' : 'Completed';
    else status = randomItem(['Pending', 'Preparing', 'Ready', 'Completed']);

    let orderNumber;
    do {
      orderNumber = 'RF-' + toDateKey(when).replace(/-/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);
    } while (orders.some(o => o.orderNumber === orderNumber));

    orders.push({
      orderNumber,
      customerName: randomItem(names),
      phone: '0300' + Math.floor(1000000 + Math.random() * 9000000),
      address: orderType === 'Delivery' ? 'Sample address, Lahore' : '-',
      orderType,
      paymentMethod: randomItem(PAYMENT_METHODS),
      notes: '',
      items,
      subtotal: bill.subtotal,
      discount: bill.discount,
      delivery: bill.delivery,
      total: bill.total,
      status,
      createdAt: when.toISOString(),
      sample: true
    });
  }
  saveOrders(orders);

  const reservations = getReservations();
  for (let i = 0; i < 5; i++) {
    const day = new Date();
    day.setDate(day.getDate() + Math.floor(Math.random() * 6));
    reservations.push({
      id: generateReservationId(),
      name: randomItem(names),
      phone: '0321' + Math.floor(1000000 + Math.random() * 9000000),
      date: toDateKey(day),
      time: randomItem(['13:00', '14:00', '19:00', '20:00', '21:00']),
      guests: 2 + Math.floor(Math.random() * 8),
      notes: '',
      status: randomItem(['Pending', 'Confirmed']),
      createdAt: new Date().toISOString(),
      sample: true
    });
    saveReservations(reservations);   // saved each time so IDs stay unique
  }

  renderAll();
  showToast('Sample data added.', 'success');
}

function resetDemoData() {
  if (!confirm('Reset demo data?\n\nThis permanently deletes all orders, reservations, messages, the cart and any menu changes (the original menu is restored).')) return;
  Object.values(KEYS).forEach(key => localStorage.removeItem(key));
  updateCartBadge();
  renderAll();
  showToast('All data has been reset.', 'success');
}

document.getElementById('loadSampleBtn').addEventListener('click', loadSampleData);
document.getElementById('resetBtn').addEventListener('click', resetDemoData);

renderAll();
