// script.js
const app = document.getElementById("app");

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Fetch products from local JSON
const fetchProducts = async () => {
  try {
    const res = await fetch("/data/products.json");
    if (!res.ok) throw new Error("Failed to fetch products");
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
};
// let totalCount = 0;



// Render products to the DOM
const renderProducts = (products) => {
  const productsContainer = $(".product-list");
  if (!productsContainer) return; // Safety check
  productsContainer.innerHTML = "";

  products.forEach((product) => {
    const productCard = document.createElement("li");
    productCard.className = "product-item";
    productCard.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="product-image" />
      <h4 class="product-name">${product.name}</h4>
      <p class="product-price">$${product.price.toFixed(2)}</p>
      <button class="add-to-cart-btn" data-id="${
        product.id
      }">Add to Cart</button>
    `;
    productsContainer.appendChild(productCard);
    // totalCount++;
  });

  // Update total items
  const totalItems = $(".product-header .total-items");
  if (totalItems) totalItems.textContent = `${products.length} items found`;
};

// SPA Page Loader
async function loadPage(page) {
  try {
    const res = await fetch(`/pages/${page}.html`);
    if (!res.ok) throw new Error("Page not found");
    app.innerHTML = await res.text();

    // If products page, render products after injection
    if (page === "products") {
      const products = await fetchProducts();
      renderProducts(products);
    }
  } catch (err) {
    console.warn(`${page} not found, redirecting to home.`);
    history.replaceState(null, null, "/home");
    loadPage("home");
  }
}

// SPA navigation
function navigateTo(url) {
  history.pushState(null, null, url);
  router();
}

// Router
function router() {
  const path = location.pathname.replace("/", "") || "home";
  loadPage(path);
}

// Link interception
document.body.addEventListener("click", (e) => {
  const link = e.target.closest("[data-link]");
  if (link) {
    e.preventDefault();
    navigateTo(link.href);
  }
});

// Back/forward support
window.addEventListener("popstate", router);

// Initial load
document.addEventListener("DOMContentLoaded", router);

let cartCount = 0;
  $("#cart-count").textContent = cartCount;

// Event delegation for dynamically created add-to-cart buttons
document.body.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-to-cart-btn");
  if (!btn) return;
  const id = btn.dataset.id;
  // Here you would typically update the cart state
  cartCount++;
  $("#cart-count").textContent = cartCount;
  console.log(`Added product ${id} to cart`);
});




let cart = []; // store cart items

// Add product to cart
function addToCart(product) {
  const existing = cart.find((p) => p.id === product.id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  renderCart();
  updateCartCount();
}

// Update cart item count badge
function updateCartCount() {
  const count = cart.reduce((acc, item) => acc + item.quantity, 0);
  const badge = $("#cart-count");
  if (badge) badge.textContent = count;
}

// Render cart page (mobile version)
function renderCart() {
  const cartList = $(".cart-list");
  const summary = $(".cart-summary");
  if (!cartList || !summary) return;

  cartList.innerHTML = ""; // clear previous items
  let totalItems = 0;
  let totalPrice = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";
    cartItem.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <div class="item-details">
        <h3>${item.name}</h3>
        <p>Price: $${item.price.toFixed(2)}</p>
        <label for="quantity-${index}">Quantity:</label>
        <input type="number" id="quantity-${index}" value="${item.quantity}" min="1" data-id="${item.id}" class="cart-qty"/>
        <p>Total: $${itemTotal.toFixed(2)}</p>
        <button class="remove-btn" data-id="${item.id}">Remove</button>
      </div>
    `;
    cartList.appendChild(cartItem);

    totalItems += item.quantity;
    totalPrice += itemTotal;
  });

  summary.querySelector("p:nth-child(2)").textContent = `Total Items: ${totalItems}`;
  summary.querySelector("p:nth-child(3)").textContent = `Total Price: $${totalPrice.toFixed(2)}`;
}

// Event delegation for buttons and inputs
document.body.addEventListener("click", (e) => {
  // Add to cart button
  const addBtn = e.target.closest(".add-to-cart-btn");
  if (addBtn) {
    const id = addBtn.dataset.id;
    fetchProducts().then((products) => {
      const product = products.find((p) => p.id == id);
      if (product) addToCart(product);
    });
  }

  // Remove button
  const removeBtn = e.target.closest(".remove-btn");
  if (removeBtn) {
    const id = removeBtn.dataset.id;
    cart = cart.filter((item) => item.id != id);
    renderCart();
    updateCartCount();
  }
});

// Update quantity input in cart
document.body.addEventListener("input", (e) => {
  const input = e.target.closest(".cart-qty");
  if (input) {
    const id = input.dataset.id;
    const qty = parseInt(input.value);
    const item = cart.find((p) => p.id == id);
    if (item && qty >= 1) {
      item.quantity = qty;
      renderCart();
      updateCartCount();
    }
  }
});

// When cart page loads
function loadCartPage() {
  renderCart();
  updateCartCount();
}

// SPA page loader
async function loadPage(page) {
  try {
    const res = await fetch(`/pages/${page}.html`);
    if (!res.ok) throw new Error("Page not found");
    app.innerHTML = await res.text();

    if (page === "products") {
      const products = await fetchProducts();
      renderProducts(products);
    }
    if (page === "cart") {
      loadCartPage();
    }
  } catch (err) {
    console.warn(`${page} not found, redirecting to home.`);
    history.replaceState(null, null, "/home");
    loadPage("home");
  }
}

// SPA navigation helpers
function navigateTo(url) {
  history.pushState(null, null, url);
  router();
}

function router() {
  const path = location.pathname.replace("/", "") || "home";
  loadPage(path);
}

// Link interception
document.body.addEventListener("click", (e) => {
  const link = e.target.closest("[data-link]");
  if (link) {
    e.preventDefault();
    navigateTo(link.href);
  }
});

// Back/forward support
window.addEventListener("popstate", router);

// Initial load
document.addEventListener("DOMContentLoaded", router);
