function loadCart() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const container = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  const kosarDbEl = document.getElementById('kosarDb');
  container.innerHTML = '';
  let total = 0;
  let darabszam = 0;

  if (cart.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#777;">A kosarad üres 🛍️</p>';
    totalEl.textContent = 'Összesen: 0 Ft';
    if (kosarDbEl) kosarDbEl.textContent = '(0)';
    return;
  }

  cart.forEach(item => {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
      <div class="item-info">
        <div class="item-name">${item.name}</div>
        <div class="item-price">${item.price} Ft</div>
      </div>
      <div>${item.quantity} db</div>
    `;
    container.appendChild(div);
    total += item.price * item.quantity;
    darabszam += item.quantity;
  });

  totalEl.textContent = 'Összesen: ' + total.toLocaleString() + ' Ft';
  if (kosarDbEl) kosarDbEl.textContent = '(' + darabszam + ')';
}

document.getElementById('clear-cart').addEventListener('click', () => {
  localStorage.removeItem('cart');
  loadCart();
});

document.getElementById('checkout').addEventListener('click', () => {
  window.location.href = 'rendeles_elkuldo.html';
});

loadCart();