// script.js
const app = document.getElementById("app");

// DOM helpers
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Cart array
let cart = [];

// Fetch products from local JSON (relative path for GitHub Pages)
const fetchProducts = async () => {
  try {
    const res = await fetch("./data/products.json");
    if (!res.ok) throw new Error("Failed to fetch products");
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
};
console.log(fetchProducts());

// Render products list
const renderProducts = (products) => {
  console.log("got products:", products);
  
  const productsContainer = $(".product-list");
  if (!productsContainer) return;
  productsContainer.innerHTML = "";

  products.forEach((product) => {
    const productCard = document.createElement("li");
    productCard.className = "product-item";
    productCard.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="product-image" />
      <h4 class="product-name">${product.name}</h4>
      <p class="product-price">$${product.price.toFixed(2)}</p>
      <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
    `;
    productsContainer.appendChild(productCard);
  });

  const totalItems = $(".product-header .total-items");
  if (totalItems) totalItems.textContent = `${products.length} items found`;
};

// Add product to cart
const addToCart = (product) => {
  const existing = cart.find((p) => p.id === product.id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  renderCart();
  updateCartCount();
};

// Update cart badge count
const updateCartCount = () => {
  const count = cart.reduce((acc, item) => acc + item.quantity, 0);
  const badge = $("#cart-count");
  if (badge) badge.textContent = count;
};

// Render cart page
const renderCart = () => {
  const cartList = $(".cart-list");
  const summary = $(".cart-summary");
  if (!cartList || !summary) return;

  cartList.innerHTML = "";
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
};

// Load cart page
const loadCartPage = () => {
  renderCart();
  updateCartCount();
};

// SPA Page loader
const loadPage = async (page) => {
  try {
    // ✅ base path fix: always relative
    const res = await fetch(`pages/${page}.html`);
    if (!res.ok) throw new Error("Page not found");
    app.innerHTML = await res.text();

    if (page === "products") {
      console.log("yes page === products o feching");
      
      const products = await fetchProducts();
      renderProducts(products);
    }
    if (page === "cart") {
      loadCartPage();
    }
  } catch (err) {
    console.warn(`${page} not found, redirecting to home.`);
    history.replaceState(null, null, "/clothify/home");
    loadPage("home");
  }
};

// Router
const router = () => {
  // ✅ remove "/clothify/" prefix
  let path = location.pathname.replace("/clothify", "");
  if (!path) path = "home"; // default
  loadPage(path);
};

// SPA navigation
const navigateTo = (url) => {
  history.pushState(null, null, `/clothify${url}`);
  router();
};


// Event delegation for links, add/remove cart
document.body.addEventListener("click", (e) => {
  const link = e.target.closest("[data-link]");
  if (link) {
    e.preventDefault();
    navigateTo(link.getAttribute("href"));
    console.log(e.target);
    
    const Path = e.target.dataset.page
    loadPage(Path);
    
  }

  const addBtn = e.target.closest(".add-to-cart-btn");
  if (addBtn) {
    const id = addBtn.dataset.id;
    fetchProducts().then((products) => {
      const product = products.find((p) => p.id == id);
      if (product) addToCart(product);
    });
  }

  const removeBtn = e.target.closest(".remove-btn");
  if (removeBtn) {
    const id = removeBtn.dataset.id;
    cart = cart.filter((item) => item.id != id);
    renderCart();
    updateCartCount();
  }
});

// Quantity change in cart
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

// Back/forward support
window.addEventListener("popstate", router);

// Initial load
document.addEventListener("DOMContentLoaded", router);
