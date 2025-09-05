const App = document.getElementById("app");

// Add this block at the top:
const isVercel = location.hostname === "clothifyn.vercel.app";
const rootpath = isVercel ? "" : "/clothify";

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

const changeImage = (src) => {
  const mainImg = document.getElementById("mainImg");
  mainImg.src = src;
};

// Render products list
const renderProducts = (products, container) => {
  console.log("got products:", products);

  const productsContainer = $(container);
  if (!productsContainer) return;
  productsContainer.innerHTML = "";

  products.forEach((product) => {
    const productCard = document.createElement("li");
    productCard.className = "product-item";
    productCard.innerHTML = `
    <a href="/product?id=${
      product.id
    }" data-page="product" data-link class="view-product-link">
     
      <img src="${product.image}" alt="${product.name}" class="product-image" />
      </a>
      <h4 class="product-name">${product.name}</h4>
      <p class="product-price">$${product.price.toFixed(2)}</p>
      <button class="add-to-cart-btn" data-id="${
        product.id
      }">Add to Cart</button>
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
    <a href="/product?id=${
      item.id
    }" data-page="product" data-link class="view-product-link">
      <img src="${item.image}" alt="${
      item.name
    }" referrerpolicy="no-referrer" />
    </a>
      <div class="item-details">
        <h3>${item.name}</h3>
        <p>Price: $${item.price.toFixed(2)}</p>
        <label for="quantity-${index}">Quantity:</label>
        <input type="number" id="quantity-${index}" value="${
      item.quantity
    }" min="1" data-id="${item.id}" class="cart-qty"/>
        <p>Total: $${itemTotal.toFixed(2)}</p>
        <button class="remove-btn" data-id="${item.id}">Remove</button>
      </div>
    `;
    cartList.appendChild(cartItem);

    totalItems += item.quantity;
    totalPrice += itemTotal;
  });

  summary.querySelector(
    "p:nth-child(2)"
  ).textContent = `Total Items: ${totalItems}`;
  summary.querySelector(
    "p:nth-child(3)"
  ).textContent = `Total Price: $${totalPrice.toFixed(2)}`;
};

// ? Related Products

const renderRelatedProducts = (products, product) => {
  const relatedProducts = products
    .filter((p) => p.id != product.id)
    .slice(0, 4); // Get 4 related products

  console.log("related products:", relatedProducts);

  const relatedProductContainer = $("#related-products-list");

  if (!relatedProductContainer) return;

  relatedProductContainer.innerHTML = "";

  try {
    relatedProducts.forEach((product) => {
      console.log(product);

      const productCard = document.createElement("li");
      productCard.className = "product-item";
      productCard.innerHTML = `
    <a href="/product?id=${
      product.id
    }" data-page="product" data-link class="view-product-link">
     
      <img src="${product.image}" alt="${product.name}" class="product-image" />
      </a>
      <h4 class="product-name">${product.name}</h4>
      <p class="product-price">$${product.price.toFixed(2)}</p>
      <button class="add-to-cart-btn" data-id="${
        product.id
      }">Add to Cart</button>
    `;
      relatedProductContainer.appendChild(productCard);
    });
  } catch (error) {
    console.warn(error);
  }
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
    const res = await fetch(`pages/${page == "/" ? "home" : page}.html`);
    if (!res.ok) throw new Error("Page not found");
    App.innerHTML = await res.text();

    if (page === "products") {
      const products = await fetchProducts();
      renderProducts(products, ".product-list");
    }
    if (page === "cart") {
      loadCartPage();
    }
    if (page === "product") {
      const params = new URLSearchParams(location.search);
      const id = params.get("id");
      if (id) {
        const products = await fetchProducts();
        const product = products.find((p) => p.id == id);
        if (product) {
          const productContainer = $(".product-detail");
          if (productContainer) {
            productContainer.innerHTML = `
            <img id="mainImg" src="${product.image}" alt="${
              product.name
            }" referrerpolicy="no-referrer" />
            <div class="thumbnail-images" id="thumbnail-images">
            ${
              product.thumbImages
                ?.map(
                  (img) =>
                    `<img
                src="${img}"
                alt="Thumbnail 1"
                class="thumbnail"
                onclick="changeImage(this.src)"
            />`
                )
                .join("") || ""
            }
            </div>
            <div class="product-info">
              <h2>${product.name}</h2>
              <p class="product-price">$${product.price.toFixed(2)}</p>
              <p class="product-description">${
                product.description || "No description available."
              }</p>

              <div class="product-id">Product ID: ${product.id}</div>
              <div class="product-category">Category: ${
                product.category || "N/A"
              }</div>
              <div class="btn-wrapper">
              <button class="add-to-cart-btn" data-id="${
                product.id
              }">Add to Cart</button>
              <button class="buy-now-btn" data-id="${
                product.id
              }">Buy Now</button>
              </div>
            </div>
            `;
          }

          // * related product

          renderRelatedProducts(products, product);
        }
      }
    }
  } catch (err) {
    console.warn(`${page} not found, redirecting to home.`);
    history.replaceState(null, null, `${rootpath}/home`);
    loadPage("home");
  }
};

// Router
const router = async () => {
  let path = location.pathname.replace(rootpath, "");
  if (!path || path === "/") path = "home";
  loadPage(path);

  if (location.href.includes("product?id=") && loadPage("product")) {
    const products = await fetchProducts();
    renderProducts();
  }

  if (location.href.includes("products") && loadPage("products")) {
    // ! Do not remove this code block, it is for while user hit back and the page is products,then load datas!!
  }
};

// SPA navigation
const navigateTo = (url) => {
  history.pushState(null, null, `${rootpath}${url}`);
  router();
};

// Event delegation for links, add/remove cart
document.body.addEventListener("click", (e) => {
  const link = e.target.closest("[data-link]");
  if (link) {
    e.preventDefault();
    navigateTo(link.getAttribute("href"));

    const Path = e.target.dataset.page || link.dataset.page;
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

  const buyBtn = e.target.closest(".buy-now-btn");
  if (buyBtn) {
    const id = buyBtn.dataset.id;
    fetchProducts().then((products) => {
      const product = products.find((p) => p.id == id);
      if (product) {
        addToCart(product);
        navigateTo("/cart");
        loadPage("cart");
      }
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

//viewProduct({img:"https://stagmenfashion.com/media/web/products/ABD58D2D-5E9A-4373-8AD1-5F167E7FE05A.jpeg.672x1200_q85_crop.jpg", name: 'White Sneakers', price: 1299, description: "No data", id:"id"})

// Back/forward support
window.addEventListener("popstate", router);

// Initial load
document.addEventListener("DOMContentLoaded", router);
