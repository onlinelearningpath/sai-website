const categories = [
  "Cars",
  "Jobs",
  "Property",
  "Electronics",
  "Services",
  "Furniture",
  "Phones",
  "Animals",
  "Fashion",
  "Business"
];

const defaultAds = [
  {
    id: crypto.randomUUID(),
    title: "Toyota Land Cruiser 2020",
    category: "Cars",
    price: 13500,
    location: "Kuwait City",
    phone: "+965 50000000",
    description: "Excellent condition, full option, clean interior and exterior.",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf",
    featured: true,
    owner: "admin"
  },
  {
    id: crypto.randomUUID(),
    title: "Frontend Developer Needed",
    category: "Jobs",
    price: 700,
    location: "Hawally",
    phone: "+965 60000000",
    description: "HTML, CSS and JavaScript developer required for full-time work.",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
    featured: false,
    owner: "admin"
  },
  {
    id: crypto.randomUUID(),
    title: "Apartment for Rent",
    category: "Property",
    price: 450,
    location: "Salmiya",
    phone: "+965 65000000",
    description: "Two-bedroom apartment near restaurants, schools and services.",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
    featured: true,
    owner: "admin"
  }
];

let ads = JSON.parse(localStorage.getItem("kc_ads")) || defaultAds;
let users = JSON.parse(localStorage.getItem("kc_users")) || [
  { name: "admin", password: "1234" }
];

let currentUser = localStorage.getItem("kc_current_user") || "";
let favorites = JSON.parse(localStorage.getItem("kc_favorites")) || [];
let showFavoritesOnly = false;
let currentLanguage = localStorage.getItem("kc_language") || "en";

const adsContainer = document.getElementById("adsContainer");
const categoryBar = document.getElementById("categoryBar");
const categoryFilter = document.getElementById("categoryFilter");
const categorySelect = document.getElementById("category");
const locationFilter = document.getElementById("locationFilter");
const searchInput = document.getElementById("searchInput");
const minPrice = document.getElementById("minPrice");
const maxPrice = document.getElementById("maxPrice");
const adForm = document.getElementById("adForm");
const toast = document.getElementById("toast");

function saveData() {
  localStorage.setItem("kc_ads", JSON.stringify(ads));
  localStorage.setItem("kc_users", JSON.stringify(users));
  localStorage.setItem("kc_current_user", currentUser);
  localStorage.setItem("kc_favorites", JSON.stringify(favorites));
  localStorage.setItem("kc_language", currentLanguage);
}

function showToast(message, type = "success") {
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 2500);
}

function escapeText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function cleanPhone(phone) {
  return String(phone).replace(/\D/g, "");
}

function fallbackImage(category) {
  const images = {
    Cars: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf",
    Jobs: "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
    Property: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
    Electronics: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
    Services: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e",
    Furniture: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
    Phones: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
    Animals: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b",
    Fashion: "https://images.unsplash.com/photo-1445205170230-053b83016050",
    Business: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab"
  };

  return images[category] || images.Business;
}

function initCategories() {
  categoryBar.innerHTML = `<button class="active" onclick="setCategory('all')">All</button>`;
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categorySelect.innerHTML = `<option value="">Select Category</option>`;

  categories.forEach(category => {
    categoryBar.innerHTML += `<button onclick="setCategory('${category}')">${category}</button>`;
    categoryFilter.innerHTML += `<option>${category}</option>`;
    categorySelect.innerHTML += `<option>${category}</option>`;
  });
}

function updateStats() {
  document.getElementById("totalAds").textContent = ads.length;
  document.getElementById("featuredAds").textContent = ads.filter(ad => ad.featured).length;
  document.getElementById("favoriteAds").textContent = favorites.length;
  document.getElementById("userStatus").textContent = currentUser || "Guest";
  document.getElementById("authBtn").textContent = currentUser ? `Logout (${currentUser})` : "Login";
}

function getFilteredAds() {
  const search = searchInput.value.toLowerCase();
  const selectedCategory = categoryFilter.value;
  const selectedLocation = locationFilter.value;
  const min = Number(minPrice.value) || 0;
  const max = Number(maxPrice.value) || Infinity;

  let result = ads.filter(ad => {
    const matchesSearch =
      ad.title.toLowerCase().includes(search) ||
      ad.description.toLowerCase().includes(search) ||
      ad.phone.toLowerCase().includes(search) ||
      ad.location.toLowerCase().includes(search);

    const matchesCategory =
      selectedCategory === "all" || ad.category === selectedCategory;

    const matchesLocation =
      selectedLocation === "all" || ad.location === selectedLocation;

    const matchesPrice =
      Number(ad.price) >= min && Number(ad.price) <= max;

    const matchesFavorite =
      !showFavoritesOnly || favorites.includes(ad.id);

    return matchesSearch && matchesCategory && matchesLocation && matchesPrice && matchesFavorite;
  });

  result.sort((a, b) => Number(b.featured) - Number(a.featured));
  return result;
}

function renderAds() {
  updateStats();
  updateActiveCategoryButton();

  const filteredAds = getFilteredAds();
  adsContainer.innerHTML = "";

  if (filteredAds.length === 0) {
    adsContainer.innerHTML = `<div class="empty">No ads found.</div>`;
    return;
  }

  filteredAds.forEach(ad => {
    const isOwner = currentUser && currentUser === ad.owner;
    const isFavorite = favorites.includes(ad.id);
    const image = ad.image || fallbackImage(ad.category);

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${escapeText(image)}" alt="${escapeText(ad.title)}">
      <div class="card-body">
        <span class="badge">${escapeText(ad.category)}</span>
        ${ad.featured ? `<span class="badge featured-badge">Featured</span>` : ""}
        <h3>${escapeText(ad.title)}</h3>
        <p class="price">KWD ${escapeText(ad.price)}</p>
        <p>📍 ${escapeText(ad.location)}</p>
        <p>📞 ${escapeText(ad.phone)}</p>
        <p class="description">${escapeText(ad.description)}</p>

        <div class="card-actions">
          <button class="blue" onclick="openDetails('${ad.id}')">Details</button>
          <button class="pink" onclick="toggleFavorite('${ad.id}')">${isFavorite ? "♥ Saved" : "♡ Save"}</button>
          <a class="green" href="tel:${escapeText(ad.phone)}">Call</a>
          <a class="green" target="_blank" href="https://wa.me/${cleanPhone(ad.phone)}">WhatsApp</a>
          ${isOwner ? `<button class="dark-btn" onclick="editAd('${ad.id}')">Edit</button>` : ""}
          ${isOwner ? `<button class="red" onclick="deleteAd('${ad.id}')">Delete</button>` : ""}
        </div>
      </div>
    `;

    adsContainer.appendChild(card);
  });
}

function setCategory(category) {
  categoryFilter.value = category;
  showFavoritesOnly = false;
  renderAds();
  document.getElementById("ads").scrollIntoView({ behavior: "smooth" });
}

function updateActiveCategoryButton() {
  const selected = categoryFilter.value;

  document.querySelectorAll(".category-bar button").forEach(button => {
    button.classList.remove("active");

    if (
      (selected === "all" && button.textContent === "All") ||
      button.textContent === selected
    ) {
      button.classList.add("active");
    }
  });
}

function toggleFavorites() {
  showFavoritesOnly = !showFavoritesOnly;
  document.getElementById("favoritesBtn").textContent =
    showFavoritesOnly ? "❤️ Showing Favorites" : "❤️ Favorites";

  renderAds();
}

function toggleFavorite(id) {
  if (!currentUser) {
    showToast("Please login to save favorites.", "error");
    openAuthModal();
    return;
  }

  if (favorites.includes(id)) {
    favorites = favorites.filter(favId => favId !== id);
    showToast("Removed from favorites.", "info");
  } else {
    favorites.push(id);
    showToast("Added to favorites.", "success");
  }

  saveData();
  renderAds();
}

function openDetails(id) {
  const ad = ads.find(item => item.id === id);
  if (!ad) return;

  const image = ad.image || fallbackImage(ad.category);

  document.getElementById("detailsContent").innerHTML = `
    <img src="${escapeText(image)}" alt="${escapeText(ad.title)}">
    <h2>${escapeText(ad.title)}</h2>
    <p><strong>Category:</strong> ${escapeText(ad.category)}</p>
    <p><strong>Price:</strong> KWD ${escapeText(ad.price)}</p>
    <p><strong>Location:</strong> ${escapeText(ad.location)}</p>
    <p><strong>Phone:</strong> ${escapeText(ad.phone)}</p>
    <p><strong>Seller:</strong> ${escapeText(ad.owner)}</p>
    <p><strong>Description:</strong></p>
    <p>${escapeText(ad.description)}</p>
    <br>
    <a class="btn" href="tel:${escapeText(ad.phone)}">Call Seller</a>
    <a class="btn blue" target="_blank" href="https://wa.me/${cleanPhone(ad.phone)}">WhatsApp</a>
  `;

  openModal("detailsModal");
}

function openAuthModal() {
  if (currentUser) {
    currentUser = "";
    saveData();
    updateStats();
    renderAds();
    showToast("Logged out.", "info");
    return;
  }

  openModal("authModal");
}

function registerUser() {
  const name = document.getElementById("authName").value.trim();
  const password = document.getElementById("authPassword").value.trim();

  if (!name || !password) {
    showToast("Enter username and password.", "error");
    return;
  }

  if (users.some(user => user.name === name)) {
    showToast("Username already exists.", "error");
    return;
  }

  users.push({ name, password });
  currentUser = name;
  saveData();
  closeModal("authModal");
  updateStats();
  renderAds();
  showToast("Registered successfully.", "success");
}

function loginUser() {
  const name = document.getElementById("authName").value.trim();
  const password = document.getElementById("authPassword").value.trim();

  const user = users.find(item => item.name === name && item.password === password);

  if (!user) {
    showToast("Wrong username or password.", "error");
    return;
  }

  currentUser = name;
  saveData();
  closeModal("authModal");
  updateStats();
  renderAds();
  showToast("Logged in successfully.", "success");
}

function readImageFile(file) {
  return new Promise(resolve => {
    if (!file) {
      resolve("");
      return;
    }

    const reader = new FileReader();
    reader.onload = event => resolve(event.target.result);
    reader.readAsDataURL(file);
  });
}

adForm.addEventListener("submit", async event => {
  event.preventDefault();

  if (!currentUser) {
    showToast("Please login before posting.", "error");
    openAuthModal();
    return;
  }

  const editId = document.getElementById("editId").value;
  const imageFile = document.getElementById("imageFile").files[0];
  const imageData = await readImageFile(imageFile);

  const adData = {
    title: document.getElementById("title").value.trim(),
    category: document.getElementById("category").value,
    price: Number(document.getElementById("price").value),
    location: document.getElementById("location").value,
    phone: document.getElementById("phone").value.trim(),
    description: document.getElementById("description").value.trim(),
    featured: document.getElementById("featured").checked,
    owner: currentUser
  };

  if (editId) {
    const index = ads.findIndex(ad => ad.id === editId);

    if (index === -1 || ads[index].owner !== currentUser) {
      showToast("You cannot edit this ad.", "error");
      return;
    }

    ads[index] = {
      ...ads[index],
      ...adData,
      image: imageData || ads[index].image
    };

    showToast("Advertisement updated.", "success");
  } else {
    ads.unshift({
      id: crypto.randomUUID(),
      ...adData,
      image: imageData || fallbackImage(adData.category)
    });

    showToast("Advertisement added.", "success");
  }

  saveData();
  resetForm();
  renderAds();
});

function editAd(id) {
  const ad = ads.find(item => item.id === id);

  if (!ad || ad.owner !== currentUser) {
    showToast("You cannot edit this ad.", "error");
    return;
  }

  document.getElementById("editId").value = ad.id;
  document.getElementById("title").value = ad.title;
  document.getElementById("category").value = ad.category;
  document.getElementById("price").value = ad.price;
  document.getElementById("location").value = ad.location;
  document.getElementById("phone").value = ad.phone;
  document.getElementById("description").value = ad.description;
  document.getElementById("featured").checked = ad.featured;
  document.getElementById("formTitle").textContent = "Edit Advertisement";
  document.getElementById("submitBtn").textContent = "Update Advertisement";

  document.getElementById("post").scrollIntoView({ behavior: "smooth" });
}

function deleteAd(id) {
  const ad = ads.find(item => item.id === id);

  if (!ad || ad.owner !== currentUser) {
    showToast("You can delete only your own ads.", "error");
    return;
  }

  if (!confirm("Delete this advertisement?")) return;

  ads = ads.filter(item => item.id !== id);
  favorites = favorites.filter(favId => favId !== id);

  saveData();
  renderAds();
  showToast("Advertisement deleted.", "error");
}

function resetForm() {
  adForm.reset();
  document.getElementById("editId").value = "";
  document.getElementById("formTitle").textContent = "Post New Advertisement";
  document.getElementById("submitBtn").textContent = "Add Advertisement";
}

function openModal(id) {
  document.getElementById(id).style.display = "flex";
}

function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

function toggleLanguage() {
  currentLanguage = currentLanguage === "en" ? "ar" : "en";
  document.body.classList.toggle("rtl", currentLanguage === "ar");

  document.getElementById("languageBtn").textContent =
    currentLanguage === "en" ? "عربي" : "English";

  document.querySelectorAll("[data-en]").forEach(element => {
    element.textContent = element.dataset[currentLanguage];
  });

  saveData();
}

function applyLanguage() {
  if (currentLanguage === "ar") {
    document.body.classList.add("rtl");
    document.getElementById("languageBtn").textContent = "English";

    document.querySelectorAll("[data-en]").forEach(element => {
      element.textContent = element.dataset.ar;
    });
  }
}

/* AI-style Chatbot */

function toggleChatbot() {
  const chatWindow = document.getElementById("chatWindow");
  chatWindow.style.display = chatWindow.style.display === "block" ? "none" : "block";
}

function addChatMessage(message, sender = "bot") {
  const chatMessages = document.getElementById("chatMessages");
  const div = document.createElement("div");

  div.className = sender === "user" ? "user-message" : "bot-message";
  div.textContent = message;

  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendChatMessage(event) {
  event.preventDefault();

  const input = document.getElementById("chatInput");
  const message = input.value.trim();

  if (!message) return;

  addChatMessage(message, "user");
  input.value = "";

  setTimeout(() => {
    addChatMessage(getAIReply(message), "bot");
  }, 500);
}

function quickChat(message) {
  document.getElementById("chatInput").value = message;
  sendChatMessage(new Event("submit"));
}

function getAIReply(message) {
  const text = message.toLowerCase();

  if (text.includes("hello") || text.includes("hi") || text.includes("salam")) {
    return "Hello! How can I help you today? You can ask about cars, jobs, posting ads, login, favorites, prices, or sellers.";
  }

  if (text.includes("what is this") || text.includes("website") || text.includes("help")) {
    return "This is a classifieds marketplace where users can post and find cars, jobs, property, electronics, furniture, phones, services, animals, fashion, and business ads.";
  }

  if (text.includes("post") || text.includes("add ad") || text.includes("add advertisement")) {
    return currentUser
      ? "To post an ad, go to Post Ad, add title, category, price, location, phone, image, and description, then click Add Advertisement."
      : "You need to login first before posting. Click Login in the header or use admin / 1234 for testing.";
  }

  if (text.includes("login") || text.includes("register") || text.includes("account")) {
    return "Click Login in the header. You can register a new account or test with username admin and password 1234.";
  }

  if (text.includes("delete")) {
    return "You can delete only ads that you posted from your own account. Login, find your ad, then click Delete.";
  }

  if (text.includes("edit") || text.includes("update")) {
    return "Login first, then open your own ad and click Edit. You can update price, phone, image, location, description, and featured status.";
  }

  if (text.includes("favorite") || text.includes("save")) {
    return "Login first, then click Save on any ad. You can view saved ads using the Favorites button.";
  }

  if (text.includes("contact") || text.includes("seller") || text.includes("call") || text.includes("whatsapp")) {
    return "Open the ad details, then use Call Seller or WhatsApp to contact the seller directly.";
  }

  if (text.includes("car") || text.includes("cars")) {
    setCategory("Cars");
    return "I opened the Cars category for you. You can also use the price and location filters.";
  }

  if (text.includes("job") || text.includes("jobs") || text.includes("work")) {
    setCategory("Jobs");
    return "I opened the Jobs category for you. Search by job title or location.";
  }

  if (text.includes("property") || text.includes("apartment") || text.includes("rent") || text.includes("house")) {
    setCategory("Property");
    return "I opened the Property category for you. You can filter by location and price.";
  }

  if (text.includes("phone") || text.includes("mobile") || text.includes("iphone") || text.includes("samsung")) {
    setCategory("Phones");
    return "I opened the Phones category for you.";
  }

  if (text.includes("furniture") || text.includes("sofa") || text.includes("bed")) {
    setCategory("Furniture");
    return "I opened the Furniture category for you.";
  }

  if (text.includes("service") || text.includes("repair") || text.includes("maintenance")) {
    setCategory("Services");
    return "I opened the Services category for you.";
  }

  if (text.includes("animal") || text.includes("pet") || text.includes("dog") || text.includes("cat")) {
    setCategory("Animals");
    return "I opened the Animals category for you.";
  }

  if (text.includes("fashion") || text.includes("clothes") || text.includes("shoes")) {
    setCategory("Fashion");
    return "I opened the Fashion category for you.";
  }

  if (text.includes("business") || text.includes("company") || text.includes("office")) {
    setCategory("Business");
    return "I opened the Business category for you.";
  }

  if (text.includes("cheap") || text.includes("low price") || text.includes("budget")) {
    minPrice.value = "";
    maxPrice.value = 500;
    renderAds();
    return "I filtered ads under KWD 500 for you.";
  }

  if (text.includes("expensive") || text.includes("premium")) {
    minPrice.value = 1000;
    maxPrice.value = "";
    renderAds();
    return "I filtered premium ads above KWD 1000 for you.";
  }

  if (text.includes("featured")) {
    return "Featured ads are important ads shown first. When posting or editing, tick Featured Ad.";
  }

  if (text.includes("dark")) {
    toggleDarkMode();
    return "Dark mode has been changed.";
  }

  if (text.includes("arabic") || text.includes("عربي")) {
    toggleLanguage();
    return "Language has been changed.";
  }

  if (text.includes("kuwait city")) {
    locationFilter.value = "Kuwait City";
    renderAds();
    return "I filtered ads in Kuwait City.";
  }

  if (text.includes("hawally")) {
    locationFilter.value = "Hawally";
    renderAds();
    return "I filtered ads in Hawally.";
  }

  if (text.includes("salmiya")) {
    locationFilter.value = "Salmiya";
    renderAds();
    return "I filtered ads in Salmiya.";
  }

  if (text.includes("farwaniya")) {
    locationFilter.value = "Farwaniya";
    renderAds();
    return "I filtered ads in Farwaniya.";
  }

  if (text.includes("ahmadi")) {
    locationFilter.value = "Ahmadi";
    renderAds();
    return "I filtered ads in Ahmadi.";
  }

  if (text.includes("jahra")) {
    locationFilter.value = "Jahra";
    renderAds();
    return "I filtered ads in Jahra.";
  }

  if (text.includes("thank")) {
    return "You are welcome! I am here to help.";
  }

  return "I can help with ads, cars, jobs, property, phones, posting, login, edit, delete, favorites, prices, locations, dark mode, Arabic, and contacting sellers. Try asking: show cars, cheap ads, jobs in Hawally, or how to post an ad.";
}

searchInput.addEventListener("input", renderAds);
categoryFilter.addEventListener("change", renderAds);
locationFilter.addEventListener("change", renderAds);
minPrice.addEventListener("input", renderAds);
maxPrice.addEventListener("input", renderAds);

initCategories();
applyLanguage();
renderAds();
showToast("Welcome to Kuwait Classifieds Pro.", "info");