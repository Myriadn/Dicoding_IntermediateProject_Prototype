// src/scripts/pages/home/home-page.js
import HomePresenter from "./home-presenter";

export default class HomePage {
  constructor() {
    this.presenter = new HomePresenter(this);
  }

  async render() {
    return `
      <a href="#main-content" class="skip-to-content">Langsung ke konten</a>
      <section class="container" id="main-content">
        <h1>Daftar Story</h1>
        <div id="story-list"></div>
      </section>
    `;
  }

  async afterRender() {
    this.presenter.loadStories();
  }

  displayStories(stories) {
    const container = document.getElementById("story-list");
    container.innerHTML = stories
      .map(
        (story) => `
      <div class="story-item">
        <img src="${story.photoUrl}" 
             alt="Foto oleh ${story.name}: ${story.description}"
             loading="lazy">
        <h2>${story.name}</h2>
        <p>${story.description}</p>
        ${
          story.lat && story.lon
            ? `<div class="mini-map" 
                   data-lat="${story.lat}" 
                   data-lon="${story.lon}"></div>`
            : ""
        }
        <a href="#/story/${story.id}">Lihat Detail</a>
      </div>
    `
      )
      .join("");

    // Inisialisasi peta SETELAH DOM di-update
    this.initMiniMaps();
  }

  initMiniMaps() {
    document.querySelectorAll(".mini-map").forEach((mapEl) => {
      const lat = mapEl.dataset.lat;
      const lon = mapEl.dataset.lon;

      if (lat && lon) {
        const miniMap = L.map(mapEl, {
          zoomControl: false,
          attributionControl: false,
        }).setView([lat, lon], 13);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 16,
          minZoom: 10,
        }).addTo(miniMap);

        L.marker([lat, lon]).addTo(miniMap);

        // Tambahkan style untuk inisialisasi peta
        mapEl.style.height = "150px";
        mapEl.style.borderRadius = "8px";
        mapEl.style.marginTop = "10px";

        miniMap.invalidateSize(); // Penting untuk update layout
      }
    });
  }

  showError(message) {
    const container = document.getElementById("story-list");
    container.innerHTML = `<p class="error">⛔ ${message}</p>`;
  }
}
