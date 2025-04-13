import { getStoryDetail } from "../../data/api";
import { showFormattedDate } from "../../utils";
import { parseActivePathname } from "../../routes/url-parser";
import NavigationHelper from "../../utils/navigation-helper";

export default class StoryDetailPage {
  async render() {
    const { id } = parseActivePathname();
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.hash = "/login";
      return "";
    }
    const response = await getStoryDetail(id, token);
    if (response.error) {
      return `
        <section class="container" id="main-content">
          <p class="error">Error: ${response.message}</p>
          <a href="#/" class="btn-primary">Kembali ke Beranda</a>
        </section>
      `;
    }
    const story = response.story;
    return `
    <section class="story-detail" id="main-content">
      <div class="detail-header">
        <h1>${story.name}'s Story</h1>
        <div class="meta-info">
          <span class="date">${showFormattedDate(story.createdAt)}</span>
          <span class="location">
            <i class="fas fa-map-marker-alt"></i>
            ${
              story.lat && story.lon
                ? `${story.lat}, ${story.lon}`
                : "Lokasi tidak tersedia"
            }
          </span>
        </div>
      </div>
      
      <div class="content-grid">
        <div class="image-container">
          <img src="${story.photoUrl}" alt="${story.description}">
        </div>
        
        <div class="description-card">
          <h2>Story Description</h2>
          <p>${story.description}</p>
        </div>
        
        ${
          story.lat && story.lon
            ? `
        <div class="map-card">
          <h2>Story Location</h2>
          <div id="map"></div>
        </div>
        `
            : ""
        }
      </div>
    </section>
  `;
  }

  async afterRender() {
    // Menggunakan NavigationHelper untuk pengaturan navigasi
    NavigationHelper.setupAuthenticatedNavigation();

    const { id } = parseActivePathname();
    const token = localStorage.getItem("token");
    const response = await getStoryDetail(id, token);

    if (response.error) return;

    const story = response.story;

    if (story.lat && story.lon) {
      const mapElement = document.getElementById("map");
      if (mapElement) {
        try {
          const map = L.map("map").setView([story.lat, story.lon], 13);

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(map);

          L.marker([story.lat, story.lon])
            .addTo(map)
            .bindPopup(`<b>${story.name}</b><br>${story.description}`)
            .openPopup();
        } catch (error) {
          console.error("Error initializing map:", error);
        }
      }
    }
  }
}
