/* =====================================================
   menu.js  -  Menu page: search, filters, sorting
   ===================================================== */

const menuGrid = document.getElementById('menuGrid');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const vegOnly = document.getElementById('vegOnly');
const spicyOnly = document.getElementById('spicyOnly');
const categoryBox = document.getElementById('categoryFilters');
const noResults = document.getElementById('noResults');
const resultCount = document.getElementById('resultCount');

let selectedCategory = 'All';

// Build the category buttons from the dishes that exist right now
function renderCategoryButtons() {
  const categories = ['All', ...new Set(getMenu().map(d => d.category))];
  categoryBox.innerHTML = categories.map(cat =>
    `<button class="btn btn-outline-gold ${cat === selectedCategory ? 'active' : ''}" data-category="${escapeHtml(cat)}">${escapeHtml(cat)}</button>`
  ).join('');
}

// Apply search + category + checkboxes + sorting, then draw the cards
function renderMenu() {
  const keyword = searchInput.value.trim().toLowerCase();
  let dishes = getMenu().filter(d => {
    const matchesSearch = !keyword ||
      d.name.toLowerCase().includes(keyword) ||
      d.desc.toLowerCase().includes(keyword) ||
      d.category.toLowerCase().includes(keyword);
    const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory;
    const matchesVeg = !vegOnly.checked || d.veg;
    const matchesSpicy = !spicyOnly.checked || d.spicy;
    return matchesSearch && matchesCategory && matchesVeg && matchesSpicy;
  });

  if (sortSelect.value === 'low') dishes.sort((a, b) => a.price - b.price);
  if (sortSelect.value === 'high') dishes.sort((a, b) => b.price - a.price);
  if (sortSelect.value === 'name') dishes.sort((a, b) => a.name.localeCompare(b.name));

  menuGrid.innerHTML = dishes.map(dishCardHTML).join('');
  noResults.classList.toggle('d-none', dishes.length > 0);
  resultCount.textContent = dishes.length ? `Showing ${dishes.length} dish${dishes.length === 1 ? '' : 'es'}` : '';
}

// ---------- Events ----------
categoryBox.addEventListener('click', event => {
  const button = event.target.closest('button[data-category]');
  if (!button) return;
  selectedCategory = button.dataset.category;
  renderCategoryButtons();
  renderMenu();
});

[searchInput, sortSelect, vegOnly, spicyOnly].forEach(el => {
  el.addEventListener('input', renderMenu);
  el.addEventListener('change', renderMenu);
});

document.getElementById('clearFilters').addEventListener('click', () => {
  searchInput.value = '';
  sortSelect.value = 'default';
  vegOnly.checked = false;
  spicyOnly.checked = false;
  selectedCategory = 'All';
  renderCategoryButtons();
  renderMenu();
});

// Support links like menu.html?category=Pizza or menu.html?search=burger
const params = new URLSearchParams(location.search);
if (params.get('category')) selectedCategory = params.get('category');
if (params.get('search')) searchInput.value = params.get('search');

renderCategoryButtons();
renderMenu();
