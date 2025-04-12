import { getStoryDetail } from "../../data/api";
import { showFormattedDate } from "../../utils";
import { parseActivePathname } from "../../routes/url-parser";

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
      return `<p>Error: ${response.message}</p>`;
    }
    const story = response.story;
    return `
    <section class="story-detail">
      <div class="detail-header">
        <h1>${story.name}'s Story</h1>
        <div class="meta-info">
          <span class="date">${showFormattedDate(story.createdAt)}</span>
          <span class="location">
            <i class="fas fa-map-marker-alt"></i>
            ${story.lat}, ${story.lon}
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
        
        <div class="map-card">
          <h2>Story Location</h2>
          <div id="map"></div>
        </div>
      </div>
    </section>
  `;
  }

  async afterRender() {
    const { id } = parseActivePathname();
    const token = localStorage.getItem("token");
    const response = await getStoryDetail(id, token);
    const story = response.story;

    if (story.lat && story.lon) {
      const map = L.map("map").setView([story.lat, story.lon], 13);

      // Gunakan API key dari STUDENT.txt
      const maptiler = L.tileLayer(
        `https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=TiT8kbsd6BWDDh8fs3Pn`,
        { attribution: "© MapTiler" }
      ).addTo(map);

      L.marker([story.lat, story.lon])
        .addTo(map)
        .bindPopup(`<b>${story.name}</b><br>${story.description}`);
    }
  }
}
