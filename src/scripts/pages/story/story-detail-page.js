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
      <!-- Di semua halaman -->
      <a href="#main-content" class="skip-to-content">Langsung ke konten</a>
      <section class="container" id="main-content">
        <h1>${story.name}'s Story</h1>
        <img src="${story.photoUrl}" alt="Foto story oleh ${story.name}">
        <p>${story.description}</p>
        <p>${showFormattedDate(story.createdAt)}</p>
        <div class="map-container">
            <div id="map"></div>
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
