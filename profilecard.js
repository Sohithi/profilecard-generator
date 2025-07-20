const form = document.getElementById("cardForm");
const previewContainer = document.getElementById("previewContainer");
const cardsContainer = document.getElementById("cardsContainer");

let cards = JSON.parse(localStorage.getItem("profileCards")) || [];

function renderCard(data, id = Date.now()) {
    const card = document.createElement("div");
    card.className = `card ${data.theme || "light"} ${data.borderStyle}`;
    card.dataset.id = id;

    card.innerHTML = `
    <img src="${data.image || ''}" alt="Profile Picture">
    <h3>${data.name}</h3>
    <p>${data.bio}</p>
    <div class="actions">
      <button class="theme-toggle">Toggle Theme</button>
      <button class="edit-btn">Edit</button>
      <button class="delete-btn">Delete</button>
    </div>
  `;

    // Theme toggle
    card.querySelector(".theme-toggle").addEventListener("click", () => {
        card.classList.toggle("dark");
        const index = cards.findIndex(c => c.id == id);
        cards[index].theme = card.classList.contains("dark") ? "dark" : "light";
        updateLocalStorage();
    });

    // Delete button
    card.querySelector(".delete-btn").addEventListener("click", () => {
        card.remove();
        cards = cards.filter(c => c.id != id);
        updateLocalStorage();
    });

    // Edit button
    card.querySelector(".edit-btn").addEventListener("click", () => {
        const current = cards.find(c => c.id == id);
        form.name.value = current.name;
        form.bio.value = current.bio;
        form.borderStyle.value = current.borderStyle;
        form.dataset.editId = id;
        previewContainer.innerHTML = '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    cardsContainer.appendChild(card);
}

function updateLocalStorage() {
    localStorage.setItem("profileCards", JSON.stringify(cards));
}

function getImageURL(fileInput) {
    return new Promise((resolve) => {
        if (!fileInput.files[0]) return resolve(null);
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(fileInput.files[0]);
    });
}

document.getElementById("previewBtn").addEventListener("click", async () => {
    const name = form.name.value.trim();
    const bio = form.bio.value.trim();
    const borderStyle = form.borderStyle.value;
    const image = await getImageURL(document.getElementById("imageUpload"));

    if (!name || !bio) return alert("Name and bio are required");

    previewContainer.innerHTML = "";

    const preview = document.createElement("div");
    preview.className = `card light ${borderStyle}`;
    preview.innerHTML = `
    <img src="${image || ''}" alt="Preview Picture">
    <h3>${name}</h3>
    <p>${bio}</p>
  `;
    previewContainer.appendChild(preview);
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = form.name.value.trim();
    const bio = form.bio.value.trim();
    const borderStyle = form.borderStyle.value;
    const image = await getImageURL(document.getElementById("imageUpload"));
    const editId = form.dataset.editId;

    if (!name || !bio) {
        alert("Name and bio are required.");
        return;
    }

    if (editId) {
        // Editing
        const index = cards.findIndex(c => c.id == editId);
        cards[index].name = name;
        cards[index].bio = bio;
        cards[index].borderStyle = borderStyle;
        if (image) cards[index].image = image;
        delete form.dataset.editId;
        cardsContainer.innerHTML = '';
        cards.forEach(c => renderCard(c, c.id));
    } else {
        // New Card
        const newCard = {
            id: Date.now(),
            name,
            bio,
            image,
            borderStyle,
            theme: "light"
        };
        cards.push(newCard);
        renderCard(newCard, newCard.id);
    }

    updateLocalStorage();
    form.reset();
    previewContainer.innerHTML = '';
});

cards.forEach(card => renderCard(card, card.id));
