// src/scripts/pages/home/home-page.js
import HomePresenter from "./home-presenter";
import NavigationHelper from "../../utils/navigation-helper";

export default class HomePage {
  constructor() {
    this.presenter = new HomePresenter(this);
  }

  async render() {
    // Get username from localStorage
    const userName = localStorage.getItem("userName");

    return `
      <section class="container" id="main-content">
        <div class="welcome-user">
          <h2><i class="fas fa-user"></i> Selamat datang, ${
            userName || "User"
          }!</h2>
        </div>
        <h1>Daftar Story</h1>
        <div id="story-list"></div>
      </section>
    `;
  }

  async afterRender() {
    // Menggunakan NavigationHelper untuk pengaturan navigasi
    NavigationHelper.setupAuthenticatedNavigation();

    // Load stories
    this.presenter.loadStories();
  }

  displayStories(stories) {
    const container = document.getElementById("story-list");
    if (!container) return;

    container.innerHTML = stories
      .map(
        (story) => `
      <div class="story-item">
        <img src="${story.photoUrl}" 
             alt="Foto oleh ${story.name}: ${story.description}"
             loading="lazy">
        <h2>${story.name}</h2>
        <p>${story.description}</p>
        <p class="created-at"><i class="fas fa-calendar"></i> ${this.formatDate(
          story.createdAt
        )}</p>
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

  showEmptyState() {
    const container = document.getElementById("story-list");
    if (!container) return;

    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-scroll fa-3x"></i>
        <h3>Belum ada story</h3>
        <p>Jadilah yang pertama menambahkan story!</p>
        <a href="#/add-story" class="btn-primary">
          <i class="fas fa-plus"></i> Tambah Story Baru
        </a>
      </div>
    `;
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
    if (!container) return;

    container.innerHTML = `<p class="error">⛔ ${message}</p>`;
  }
}
