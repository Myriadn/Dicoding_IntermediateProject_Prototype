import { addStory } from "../../data/api";

export default class AddStoryPage {
  async render() {
    return `      
      <a href="#main-content" class="skip-to-content">Langsung ke konten</a>
      <section class="container" id="main-content">
        <h1>Tambah Story</h1>
        <form id="add-story-form">
          <label for="description">Deskripsi</label>
          <textarea id="description" name="description" required></textarea>
          <label for="photo">Foto</label>
          <input type="file" id="photo" name="photo" accept="image/*" capture="environment" required>
          <label for="location">Lokasi</label>
          <div id="map" style="height: 300px;"></div>
          <input type="hidden" id="lat" name="lat">
          <input type="hidden" id="lon" name="lon">
          <button type="submit">Tambah Story</button>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const map = new L.Map("map").setView([0, 0], 2);

    // Tile layer OpenStreetMap
    const osm = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }
    ).addTo(map);

    // Tile layer MapTiler (ganti YOUR_MAPTILER_API_KEY dengan API key kamu)
    const maptiler = L.tileLayer(
      `https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=TiT8kbsd6BWDDh8fs3Pn`,
      {
        attribution:
          '© <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a>',
      }
    );

    // Layer control
    const baseMaps = {
      OpenStreetMap: osm,
      "MapTiler Streets": maptiler,
    };
    L.control.layers(baseMaps).addTo(map);

    let marker;
    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      if (marker) {
        marker.setLatLng([lat, lng]);
      } else {
        marker = L.marker([lat, lng]).addTo(map);
      }
      document.getElementById("lat").value = lat;
      document.getElementById("lon").value = lng;
    });

    const form = document.querySelector("#add-story-form");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const description = form.description.value;
      const photo = form.photo.files[0];
      const lat = form.lat.value;
      const lon = form.lon.value;
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.hash = "/login";
        return;
      }
      const response = await addStory({ description, photo, lat, lon, token });
      if (!response.error) {
        window.location.hash = "/";
      } else {
        alert(response.message);
      }
    });
  }
}
