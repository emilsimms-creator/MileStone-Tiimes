const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const cartDrawer = document.querySelector("[data-cart-drawer]");
const cartItems = document.querySelector("[data-cart-items]");
const cartCount = document.querySelector("[data-cart-count]");
const treatBoxBuilder = document.querySelector("#treat-box-builder");
const treatBoxCount = document.querySelector("[data-treat-box-count]");
const treatBoxStatus = document.querySelector("[data-treat-box-status]");
const quoteForm = document.querySelector("#quote-form");
const checkoutForm = document.querySelector("#checkout-form");
const quoteStatus = document.querySelector("[data-quote-status]");
const checkoutStatus = document.querySelector("[data-checkout-status]");
const eventType = document.querySelector("#event-type");
const quoteDateInput = quoteForm.querySelector('input[name="eventDate"]');
const checkoutDateInput = checkoutForm.querySelector('input[name="neededBy"]');
const confirmation = document.querySelector("[data-confirmation]");
const confirmationTitle = document.querySelector("[data-confirmation-title]");
const confirmationKicker = document.querySelector("[data-confirmation-kicker]");
const confirmationMessage = document.querySelector("[data-confirmation-message]");
const confirmationEmail = document.querySelector("[data-confirmation-email]");
const confirmationDm = document.querySelector("[data-confirmation-dm]");
const confirmationCopy = document.querySelector("[data-confirmation-copy]");
const confirmationSummary = document.querySelector("[data-confirmation-summary]");
const confirmationStatus = document.querySelector("[data-confirmation-status]");
const ownerEmail = "juliavalcin@gmail.com";
const facebookDmUrl = "https://m.me/100064224105993";
const minNoticeDays = {
  "Simple Birthday Cake": 5,
  "Custom Cake": 7,
  "Wedding Cake": 14,
  "Treat Table": 14,
  "Build a Treat Box": 2
};

const productMeta = {
  "Custom Cupcakes": { notice: "48 hour notice", category: "Treats" },
  "Cake Pops": { notice: "48 hour notice", category: "Treats" },
  "Rum Balls": { notice: "48 hour notice", category: "Treats" },
  "Build a Treat Box": { notice: "Request pricing", category: "Treats" }
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
    .map((item) => {
      const details = item.details && item.details.length
        ? `\n  Selected treats: ${item.details.join(", ")}`
        : "";
      return `- ${item.name} x ${item.quantity} (${item.notice})${details}`;
    })
    .join("\n");
}

function buildMailto(subject, body) {
  return `mailto:${ownerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function ownerNotificationLinks(subject, emailBody) {
  return {
    email: buildMailto(subject, emailBody),
    dm: facebookDmUrl
  };
}

function showNotificationLinks(statusElement, links, message) {
  statusElement.innerHTML = `
    ${message}
    <br>
    <a href="${links.email}">Email Julia</a>
    <span aria-hidden="true"> | </span>
    <a href="${links.dm}" target="_blank" rel="noreferrer">Facebook DM</a>
  `;
}

function openNotificationApps(links) {
  window.location.href = links.email;
}

function showConfirmation({ firstName, kind, eventLabel, links, summary }) {
  const isQuote = kind === "quote";
  confirmationKicker.textContent = isQuote ? "Quote request prepared" : "Order details prepared";
  confirmationTitle.textContent = `Thank you, ${firstName}.`;
  confirmationMessage.textContent = isQuote
    ? `Your ${eventLabel} request is ready for Julia. Review the email draft and press send, or copy the details and send them through Facebook DM.`
    : "Your order details are ready for Julia. Review the email draft and press send, or copy the details and send them through Facebook DM.";
  confirmationEmail.href = links.email;
  confirmationDm.href = links.dm;
  confirmationSummary.value = summary;
  confirmationCopy.dataset.copyText = summary;
  confirmationStatus.textContent = "Email handoff started. If your email app did not open, use Open email again.";
  confirmation.classList.remove("is-hidden");
  confirmation.setAttribute("aria-hidden", "false");
  document.body.classList.add("has-confirmation");
  confirmationEmail.focus({ preventScroll: true });
}

function hideConfirmation() {
  confirmation.classList.add("is-hidden");
  confirmation.setAttribute("aria-hidden", "true");
  document.body.classList.remove("has-confirmation");
}

function todayAtMidnight() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDateInput(date) {
  return date.toISOString().slice(0, 10);
}

function daysUntil(dateValue) {
  const selected = new Date(`${dateValue}T00:00:00`);
  const diff = selected.getTime() - todayAtMidnight().getTime();
  return Math.ceil(diff / 86400000);
}

function setMinimumDates() {
  const twoDaysFromNow = formatDateInput(addDays(todayAtMidnight(), 2));
  quoteDateInput.min = twoDaysFromNow;
  checkoutDateInput.min = twoDaysFromNow;
}

function updateQuoteMinimumDate() {
  const type = eventType.value;
  const requiredDays = minNoticeDays[type] || 2;
  const minimum = formatDateInput(addDays(todayAtMidnight(), requiredDays));

  quoteDateInput.min = minimum;
  if (quoteDateInput.value && quoteDateInput.value < minimum) {
    quoteDateInput.value = minimum;
  }

  if (type) {
    quoteStatus.textContent = `${type} usually needs ${requiredDays} days of notice.`;
  }
}

function noticeMessage(type, dateValue) {
  const requiredDays = minNoticeDays[type] || 2;
  const availableDays = daysUntil(dateValue);
  if (Number.isNaN(availableDays)) return "";
  if (availableDays < requiredDays) {
    return `Heads up: ${type} usually needs ${requiredDays} days of notice. Julia can review this as a rush request, but availability is not guaranteed.`;
  }
  return `${type} timing looks workable based on the usual ${requiredDays} day notice.`;
}

function populateHandoff(panelSelector, emailSelector, dmSelector, summarySelector, copySelector, links, summary) {
  const panel = document.querySelector(panelSelector);
  const emailLink = document.querySelector(emailSelector);
  const dmLink = document.querySelector(dmSelector);
  const summaryField = document.querySelector(summarySelector);
  const copyButton = document.querySelector(copySelector);

  panel.classList.remove("is-hidden");
  emailLink.href = links.email;
  dmLink.href = links.dm;
  summaryField.value = summary;
  copyButton.dataset.copyText = summary;
}

async function copySummary(button, statusElement) {
  const text = button.dataset.copyText || "";
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    statusElement.textContent = "Details copied. You can paste them into email, text, or Messenger.";
  } catch (error) {
    statusElement.textContent = "Copy did not work in this browser. Select the details box and copy manually.";
  }
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
          ${item.details && item.details.length ? `<small>${item.details.join(", ")}</small>` : ""}
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

function addProduct(name, options = {}) {
  const existing = cart.get(name);
  const meta = productMeta[name] || { notice: "Request pricing", category: "Treats" };

  cart.set(name, {
    name,
    notice: options.notice || meta.notice,
    details: options.details || existing?.details || [],
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

document.querySelectorAll("[data-scroll-target]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector(button.dataset.scrollTarget).scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

function selectedTreatBoxItems() {
  return Array.from(treatBoxBuilder.querySelectorAll('input[name="treats"]:checked'))
    .map((input) => input.value);
}

function updateTreatBoxCount() {
  const selected = selectedTreatBoxItems();
  treatBoxCount.textContent = `${selected.length} selected`;
  treatBoxStatus.textContent = selected.length >= 3
    ? "Ready to add. You can still choose more favorites."
    : "Choose at least 3 items.";
}

treatBoxBuilder.addEventListener("change", updateTreatBoxCount);

treatBoxBuilder.addEventListener("submit", (event) => {
  event.preventDefault();
  const selected = selectedTreatBoxItems();

  if (selected.length < 3) {
    treatBoxStatus.textContent = "Please choose at least 3 items to start your treat box.";
    return;
  }

  addProduct("Build a Treat Box", {
    notice: "Request pricing",
    details: selected
  });
  treatBoxStatus.textContent = `Treat box added with ${selected.length} selections.`;
});

document.querySelectorAll("[data-quote]").forEach((button) => {
  button.addEventListener("click", () => {
    eventType.value = button.dataset.quote;
    updateQuoteMinimumDate();
    document.querySelector("#custom").scrollIntoView({ behavior: "smooth", block: "start" });
    eventType.focus({ preventScroll: true });
  });
});

eventType.addEventListener("change", updateQuoteMinimumDate);

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
  const firstName = data.get("firstName");
  const lastName = data.get("lastName");
  const email = data.get("email");
  const phone = data.get("phone");
  const fullName = `${firstName} ${lastName}`.trim();
  const type = data.get("eventType");
  const date = data.get("eventDate");
  const servings = data.get("servings") || "Not provided";
  const details = data.get("details") || "No extra details provided.";
  const timingNote = noticeMessage(type, date);
  const subject = `MileStone Tiimes quote request: ${fullName} - ${type}`;
  const emailBody = [
    "New MileStone Tiimes quote request",
    "",
    "Client contact info:",
    `First name: ${firstName}`,
    `Last name: ${lastName}`,
    `Email address: ${email}`,
    `Phone number: ${phone}`,
    "",
    `Celebration type: ${type}`,
    `Event date: ${date}`,
    `Guest count or servings: ${servings}`,
    "",
    "Theme, colors, and details:",
    details,
    "",
    `Timing note: ${timingNote}`,
    "",
    "Payment model: e-transfer deposit; cash remainder on pickup or delivery.",
    "Pickup/delivery: Gloucester-area pickup or Ottawa local delivery.",
    "",
    "Submitted by:",
    `Client name: ${fullName}`,
    `Email address: ${email}`,
    `Phone number: ${phone}`,
    `Submitted from: ${window.location.href}`,
    `Submitted at: ${new Date().toLocaleString()}`
  ].join("\n");
  const links = ownerNotificationLinks(subject, emailBody);

  showNotificationLinks(
    quoteStatus,
    links,
    `${timingNote} Quote request prepared. Open email to send it, or copy the details and send them by Facebook DM.`
  );
  populateHandoff(
    "[data-quote-handoff]",
    "[data-quote-email]",
    "[data-quote-dm]",
    "[data-quote-summary]",
    "[data-copy-quote]",
    links,
    emailBody
  );
  showConfirmation({
    firstName,
    kind: "quote",
    eventLabel: type,
    links,
    summary: emailBody
  });
  openNotificationApps(links);
});

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(checkoutForm);
  const firstName = data.get("firstName");
  const lastName = data.get("lastName");
  const email = data.get("email");
  const phone = data.get("phone");
  const fullName = `${firstName} ${lastName}`.trim();
  const neededBy = data.get("neededBy");
  const fulfillment = data.get("fulfillment");
  const notes = data.get("notes") || "No extra notes provided.";
  const count = cartTotalCount();

  if (count === 0) {
    checkoutStatus.textContent = `${firstName}, add treats to the order list or use the custom quote form before confirming a deposit.`;
    openCart();
    return;
  }

  const subject = `MileStone Tiimes order: ${fullName} for ${neededBy}`;
  const timingNote = noticeMessage("Build a Treat Box", neededBy);
  const emailBody = [
    "New MileStone Tiimes order details",
    "",
    "Client contact info:",
    `First name: ${firstName}`,
    `Last name: ${lastName}`,
    `Email address: ${email}`,
    `Phone number: ${phone}`,
    "",
    `Needed by: ${neededBy}`,
    `Fulfillment: ${fulfillment}`,
    "",
    "Order items:",
    formatCartItems(),
    "",
    "Customer notes:",
    notes,
    "",
    `Timing note: ${timingNote}`,
    "",
    "Payment model: e-transfer deposit; cash remainder on pickup or delivery.",
    "Pickup/delivery: Gloucester-area pickup or Ottawa local delivery.",
    "",
    "Submitted by:",
    `Client name: ${fullName}`,
    `Email address: ${email}`,
    `Phone number: ${phone}`,
    `Submitted from: ${window.location.href}`,
    `Submitted at: ${new Date().toLocaleString()}`
  ].join("\n");
  const links = ownerNotificationLinks(subject, emailBody);

  showNotificationLinks(
    checkoutStatus,
    links,
    `${timingNote} Order details prepared. Open email to send it, or copy the details and send them by Facebook DM.`
  );
  populateHandoff(
    "[data-checkout-handoff]",
    "[data-checkout-email]",
    "[data-checkout-dm]",
    "[data-checkout-summary]",
    "[data-copy-checkout]",
    links,
    emailBody
  );
  showConfirmation({
    firstName,
    kind: "order",
    eventLabel: "order",
    links,
    summary: emailBody
  });
  openNotificationApps(links);
});

document.querySelector("[data-copy-quote]").addEventListener("click", (event) => {
  copySummary(event.currentTarget, quoteStatus);
});

document.querySelector("[data-copy-checkout]").addEventListener("click", (event) => {
  copySummary(event.currentTarget, checkoutStatus);
});

confirmationCopy.addEventListener("click", (event) => {
  copySummary(event.currentTarget, confirmationStatus);
});

document.querySelectorAll("[data-confirmation-close]").forEach((button) => {
  button.addEventListener("click", hideConfirmation);
});

confirmation.addEventListener("click", (event) => {
  if (event.target === confirmation) {
    hideConfirmation();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !confirmation.classList.contains("is-hidden")) {
    hideConfirmation();
  }
});

setMinimumDates();
updateTreatBoxCount();
renderCart();
