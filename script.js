const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const cartDrawer = document.querySelector("[data-cart-drawer]");
const cartItems = document.querySelector("[data-cart-items]");
const cartCount = document.querySelector("[data-cart-count]");
const quoteForm = document.querySelector("#quote-form");
const checkoutForm = document.querySelector("#checkout-form");
const quoteStatus = document.querySelector("[data-quote-status]");
const checkoutStatus = document.querySelector("[data-checkout-status]");
const eventType = document.querySelector("#event-type");
const ownerEmail = "juliavalcin@gmail.com";
const ownerSms = "+18193292391";

const productMeta = {
  "Custom Cupcakes": { notice: "48 hour notice", category: "Treats" },
  "Cake Pops": { notice: "48 hour notice", category: "Treats" },
  "Rum Balls": { notice: "48 hour notice", category: "Treats" },
  "Standard Treat Box": { notice: "Request pricing", category: "Treats" }
};

const cart = new Map();

function openCart() {
  cartDrawer.classList.add("is-open");
  cartDrawer.setAttribute("aria-hidden", "false");
}

function closeCart() {
  cartDrawer.classList.remove("is-open");
  cartDrawer.setAttribute("aria-hidden", "true");
}

function cartTotalCount() {
  return Array.from(cart.values()).reduce((sum, item) => sum + item.quantity, 0);
}

function formatCartItems() {
  if (cart.size === 0) return "No quick treats selected.";

  return Array.from(cart.values())
    .map((item) => `- ${item.name} x ${item.quantity} (${item.notice})`)
    .join("\n");
}

function buildMailto(subject, body) {
  return `mailto:${ownerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function buildSms(body) {
  return `sms:${ownerSms}?&body=${encodeURIComponent(body)}`;
}

function ownerNotificationLinks(subject, emailBody, smsBody) {
  return {
    email: buildMailto(subject, emailBody),
    sms: buildSms(smsBody)
  };
}

function showNotificationLinks(statusElement, links, message) {
  statusElement.innerHTML = `
    ${message}
    <br>
    <a href="${links.email}">Email Julia</a>
    <span aria-hidden="true"> | </span>
    <a href="${links.sms}">Text Julia</a>
  `;
}

function openNotificationApps(links) {
  window.open(links.sms, "_blank", "noopener,noreferrer");
  window.location.href = links.email;
}

function renderCart() {
  const count = cartTotalCount();
  cartCount.textContent = count;

  if (count === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Add cupcakes, cake pops, rum balls, or a standard box to begin.</p>';
    return;
  }

  cartItems.innerHTML = Array.from(cart.values())
    .map((item) => `
      <div class="cart-line">
        <div>
          <strong>${item.name}</strong>
          <span>${item.notice}</span>
        </div>
        <div class="quantity-controls" aria-label="${item.name} quantity">
          <button type="button" data-decrease="${item.name}" aria-label="Decrease ${item.name}">-</button>
          <strong>${item.quantity}</strong>
          <button type="button" data-increase="${item.name}" aria-label="Increase ${item.name}">+</button>
        </div>
      </div>
    `)
    .join("");
}

function addProduct(name) {
  const existing = cart.get(name);
  const meta = productMeta[name] || { notice: "Request pricing", category: "Treats" };

  cart.set(name, {
    name,
    notice: meta.notice,
    quantity: existing ? existing.quantity + 1 : 1
  });

  renderCart();
  openCart();
}

function updateProduct(name, direction) {
  const existing = cart.get(name);
  if (!existing) return;

  const nextQuantity = existing.quantity + direction;
  if (nextQuantity <= 0) {
    cart.delete(name);
  } else {
    cart.set(name, { ...existing, quantity: nextQuantity });
  }

  renderCart();
}

navToggle.addEventListener("click", () => {
  const isOpen = header.classList.toggle("nav-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".site-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    header.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

document.querySelectorAll("[data-open-cart]").forEach((button) => {
  button.addEventListener("click", openCart);
});

document.querySelectorAll("[data-close-cart]").forEach((button) => {
  button.addEventListener("click", closeCart);
});

cartDrawer.addEventListener("click", (event) => {
  if (event.target === cartDrawer) {
    closeCart();
  }
});

cartItems.addEventListener("click", (event) => {
  const increase = event.target.closest("[data-increase]");
  const decrease = event.target.closest("[data-decrease]");

  if (increase) updateProduct(increase.dataset.increase, 1);
  if (decrease) updateProduct(decrease.dataset.decrease, -1);
});

document.querySelectorAll("[data-add-product]").forEach((button) => {
  button.addEventListener("click", () => addProduct(button.dataset.addProduct));
});

document.querySelectorAll("[data-quote]").forEach((button) => {
  button.addEventListener("click", () => {
    eventType.value = button.dataset.quote;
    document.querySelector("#custom").scrollIntoView({ behavior: "smooth", block: "start" });
    eventType.focus({ preventScroll: true });
  });
});

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    document.querySelectorAll("[data-filter]").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");

    document.querySelectorAll("[data-category]").forEach((card) => {
      card.classList.toggle("is-hidden", filter !== "all" && card.dataset.category !== filter);
    });
  });
});

quoteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(quoteForm);
  const type = data.get("eventType");
  const date = data.get("eventDate");
  const servings = data.get("servings") || "Not provided";
  const details = data.get("details") || "No extra details provided.";
  const subject = `MileStone Tiimes quote request: ${type}`;
  const emailBody = [
    "New MileStone Tiimes quote request",
    "",
    `Celebration type: ${type}`,
    `Event date: ${date}`,
    `Guest count or servings: ${servings}`,
    "",
    "Theme, colors, and details:",
    details,
    "",
    "Payment model: e-transfer deposit; cash remainder on pickup or delivery.",
    "Pickup/delivery: Gloucester-area pickup or Ottawa local delivery.",
    "",
    `Submitted from: ${window.location.href}`,
    `Submitted at: ${new Date().toLocaleString()}`
  ].join("\n");
  const smsBody = `New MileStone Tiimes quote request: ${type} for ${date}. Check email for details.`;
  const links = ownerNotificationLinks(subject, emailBody, smsBody);

  showNotificationLinks(
    quoteStatus,
    links,
    "Quote request prepared. Your device should open email and SMS; use these links if it does not."
  );
  openNotificationApps(links);
});

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(checkoutForm);
  const name = data.get("name");
  const contact = data.get("contact");
  const neededBy = data.get("neededBy");
  const fulfillment = data.get("fulfillment");
  const notes = data.get("notes") || "No extra notes provided.";
  const count = cartTotalCount();

  if (count === 0) {
    checkoutStatus.textContent = `${name}, add treats to the order list or use the custom quote form before confirming a deposit.`;
    openCart();
    return;
  }

  const subject = `MileStone Tiimes order: ${name} for ${neededBy}`;
  const emailBody = [
    "New MileStone Tiimes order details",
    "",
    `Customer name: ${name}`,
    `Customer contact: ${contact}`,
    `Needed by: ${neededBy}`,
    `Fulfillment: ${fulfillment}`,
    "",
    "Order items:",
    formatCartItems(),
    "",
    "Customer notes:",
    notes,
    "",
    "Payment model: e-transfer deposit; cash remainder on pickup or delivery.",
    "Pickup/delivery: Gloucester-area pickup or Ottawa local delivery.",
    "",
    `Submitted from: ${window.location.href}`,
    `Submitted at: ${new Date().toLocaleString()}`
  ].join("\n");
  const smsBody = `New MileStone Tiimes order from ${name} for ${neededBy}. ${count} item(s). Check email for details.`;
  const links = ownerNotificationLinks(subject, emailBody, smsBody);

  showNotificationLinks(
    checkoutStatus,
    links,
    "Order details prepared. Your device should open email and SMS; use these links if it does not."
  );
  openNotificationApps(links);
});

renderCart();
