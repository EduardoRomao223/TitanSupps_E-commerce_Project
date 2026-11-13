const CART_KEY = 'titansupps_carrinho';
const LEGACY_CART_KEY = 'carrinho';
const PRODUCTS_URL = new URL('produtos.json', document.currentScript?.src || window.location.href).href;
let products = [];
let selectedCategory = 'Todos';
let toastTimer;
const money = value => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[character]));

function normalizeCart(items) {
  if (!Array.isArray(items)) return [];
  const quantities = new Map();
  items.forEach(item => {
    const id = typeof item?.id === 'string' ? item.id : '';
    const quantity = Math.floor(Number(item?.quantity ?? item?.quantidade));
    if (id && Number.isFinite(quantity) && quantity > 0) {
      quantities.set(id, (quantities.get(id) || 0) + quantity);
    }
  });
  return [...quantities].map(([id, quantity]) => ({ id, quantity }));
}

function readCart() {
  try {
    const current = localStorage.getItem(CART_KEY);
    const legacy = localStorage.getItem(LEGACY_CART_KEY);
    const currentItems = current === null ? [] : normalizeCart(JSON.parse(current));
    if (legacy !== null) {
      const legacyItems = normalizeCart(JSON.parse(legacy));
      const combined = normalizeCart([...currentItems, ...legacyItems]);
      localStorage.setItem(CART_KEY, JSON.stringify(combined));
      localStorage.removeItem(LEGACY_CART_KEY);
      return combined;
    }
    return currentItems;
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(normalizeCart(cart)));
  updateCartCount();
  renderCart();
}

function updateCartCount() {
  const total = readCart().reduce((sum, item) => sum + item.quantity, 0);
  const counter = document.getElementById('cart-count');
  if (counter) counter.textContent = total;
}

function updateAccountLabel() {
  const label = document.getElementById('account-label');
  if (!label) return;
  try {
    const account = JSON.parse(localStorage.getItem('usuario_logado') || 'null');
    const firstName = String(account?.nome || '').trim().split(/\s+/)[0];
    label.textContent = firstName ? `Olá, ${firstName}` : 'Entrar';
  } catch {
    label.textContent = 'Entrar';
  }
}
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function productCard(product) {
  return `
    <article class="product-card">
      <div class="product-photo">
        <span class="product-tag">${escapeHTML(product.tag || product.category)}</span>
        <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.imageAlt || product.name)}" loading="lazy">
      </div>
      <div class="product-info">
        <p class="product-brand">${escapeHTML(product.brand)}</p>
        <h3 class="product-name">${escapeHTML(product.name)}</h3>
        <div class="product-meta"><span>${escapeHTML(product.size)}</span><span class="product-category">${escapeHTML(product.category)}</span></div>
        <div class="product-price">${money(product.price)}${product.oldPrice ? ` <del>${money(product.oldPrice)}</del>` : ''}</div>
        <div class="product-actions"><button class="add-button" type="button" data-add="${escapeHTML(product.id)}">Adicionar ao carrinho</button><button class="add-button details-button" type="button" data-details="${escapeHTML(product.id)}">Descrição</button><a class="source-link" href="${escapeHTML(product.source)}" target="_blank" rel="noopener noreferrer">Fonte ↗</a></div>
      </div>
    </article>`;
}

function renderFilters() {
  const host = document.getElementById('category-filters');
  if (!host) return;
  const categories = ['Todos', ...new Set(products.map(product => product.category))];
  host.innerHTML = categories.map(category => `<button type="button" class="filter-button${category === selectedCategory ? ' selected' : ''}" data-category="${escapeHTML(category)}">${escapeHTML(category)}</button>`).join('');
}

function renderProducts() {
  const host = document.getElementById('product-grid');
  if (!host) return;
  const query = (document.getElementById('product-search')?.value || '').trim().toLocaleLowerCase('pt-BR');
  const filtered = products.filter(product => {
    const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
    const searchable = `${product.name} ${product.brand} ${product.category} ${product.shortDescription}`.toLocaleLowerCase('pt-BR');
    return matchesCategory && searchable.includes(query);
  });
  host.innerHTML = filtered.length ? filtered.map(productCard).join('') : '<p class="no-results">Não encontrei produtos com esse filtro.</p>';
}

function renderCart() {
  const host = document.getElementById('cart-items');
  if (!host || !products.length) return;
  const cart = readCart();
  const productMap = new Map(products.map(product => [product.id, product]));
  const items = cart.map(item => ({ ...item, product: productMap.get(item.id) })).filter(item => item.product);
  const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
  host.innerHTML = items.length ? items.map(({ id, quantity: amount, product }) => `
    <article class="cart-row">
      <div class="cart-thumb"><img src="${escapeHTML(product.image)}" alt="" loading="lazy"></div>
      <div><h3 class="cart-row-name">${escapeHTML(product.name)}</h3><small>${escapeHTML(product.size)} · ${money(product.price)} cada</small><div class="cart-controls"><button class="qty-button" type="button" data-qty="-1" data-id="${escapeHTML(id)}" aria-label="Diminuir quantidade">−</button><span class="qty-value">${amount}</span><button class="qty-button" type="button" data-qty="1" data-id="${escapeHTML(id)}" aria-label="Aumentar quantidade">+</button><button class="remove-button" type="button" data-remove="${escapeHTML(id)}">Remover</button></div></div>
      <strong class="cart-row-total">${money(product.price * amount)}</strong>
    </article>`).join('') : '<p class="empty-cart">Seu carrinho está vazio. Adicione um produto para começar.</p>';
  const quantityLabel = document.getElementById('cart-quantity');
  const totalLabel = document.getElementById('cart-total');
  const checkoutButton = document.getElementById('checkout-button');
  if (quantityLabel) quantityLabel.textContent = `${quantity} ${quantity === 1 ? 'item' : 'itens'}`;
  if (totalLabel) totalLabel.textContent = money(total);
  if (checkoutButton) checkoutButton.disabled = items.length === 0;
}

function finalizePurchase() {
  const result = document.getElementById('purchase-result');
  if (!result) return;

  const productMap = new Map(products.map(product => [product.id, product]));
  const purchased = readCart()
    .map(item => ({ ...item, product: productMap.get(item.id) }))
    .filter(item => item.product);
  if (!purchased.length) {
    showToast('Adicione um produto antes de finalizar a compra.');
    return;
  }

  const quantity = purchased.reduce((sum, item) => sum + item.quantity, 0);
  const total = purchased.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
  result.innerHTML = `
    <p class="purchase-kicker">PEDIDO CONCLUÍDO</p>
    <h2>Compra finalizada!</h2>
    <p class="purchase-intro">Estes foram os itens da sua compra:</p>
    <ul class="purchase-items">${purchased.map(({ quantity: amount, product }) => `
      <li><span><strong>${escapeHTML(product.name)}</strong><small>${amount} × ${money(product.price)}</small></span><b>${money(amount * product.price)}</b></li>
    `).join('')}</ul>
    <p class="purchase-total"><span>${quantity} ${quantity === 1 ? 'item' : 'itens'}</span><strong>Total: ${money(total)}</strong></p>
    <p class="purchase-note">Obrigado pela compra!</p>`;
  result.hidden = false;
  saveCart([]);
  showToast('Compra finalizada com sucesso.');
  result.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function addToCart(id) {
  const product = products.find(item => item.id === id);
  if (!product) return;
  const cart = readCart();
  const existing = cart.find(item => item.id === id);
  if (existing) existing.quantity += 1;
  else cart.push({ id, quantity: 1 });
  saveCart(cart);
  showToast(`${product.name} adicionado ao carrinho.`);
}

function changeQuantity(id, difference) {
  const cart = readCart();
  const item = cart.find(entry => entry.id === id);
  if (!item) return;
  item.quantity += difference;
  saveCart(cart.filter(entry => entry.quantity > 0));
}

function removeFromCart(id) {
  saveCart(readCart().filter(item => item.id !== id));
  showToast('Produto removido do carrinho.');
}

async function startPage() {
  updateCartCount();
  updateAccountLabel();
  try {
    const response = await fetch(PRODUCTS_URL);
    if (!response.ok) throw new Error('Não foi possível carregar o catálogo.');
    products = await response.json();
    renderFilters();
    renderProducts();
    renderCart();
  } catch (error) {
    const host = document.getElementById('product-grid');
    if (host) host.innerHTML = '<p class="no-results">O catálogo não carregou. Abra a página usando um servidor local.</p>';
    console.error(error);
  }
}

document.addEventListener('click', event => {
  if (event.target.closest('#checkout-button')) {
    finalizePurchase();
    return;
  }

  const addButton = event.target.closest('[data-add]');
  if (addButton) addToCart(addButton.dataset.add);

  const detailsButton = event.target.closest('[data-details]');
  if (detailsButton) {
    window.location.href = 'pages/descricao/descricao_prod.html?id=' + encodeURIComponent(detailsButton.dataset.details);
  }

  const categoryButton = event.target.closest('[data-category]');
  if (categoryButton) {
    selectedCategory = categoryButton.dataset.category;
    renderFilters();
    renderProducts();
  }

  const quantityButton = event.target.closest('[data-qty]');
  if (quantityButton) changeQuantity(quantityButton.dataset.id, Number(quantityButton.dataset.qty));

  const removeButton = event.target.closest('[data-remove]');
  if (removeButton) removeFromCart(removeButton.dataset.remove);

  if (event.target.closest('#clear-cart')) {
    saveCart([]);
    showToast('Carrinho limpo.');
  }
});

document.getElementById('product-search')?.addEventListener('input', renderProducts);
document.addEventListener('keydown', event => {
  if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    event.preventDefault();
    document.getElementById('product-search')?.focus();
  }
});
window.addEventListener('storage', event => {
  if (event.key === CART_KEY) {
    updateCartCount();
    renderCart();
  }
  if (event.key === 'usuario_logado') updateAccountLabel();
});

startPage();



