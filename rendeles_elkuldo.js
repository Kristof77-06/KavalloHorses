const cart = JSON.parse(localStorage.getItem('cart')) || [];
const list = document.getElementById('order-items');

if (cart.length === 0) {
  list.innerHTML = '<li>Nincs megjeleníthető tétel.</li>';
} else {
  cart.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.name} – ${item.quantity} db – ${item.price} Ft`;
    list.appendChild(li);
  });
}

// ürítjük a kosarat a sikeres rendelés után
localStorage.removeItem('cart');