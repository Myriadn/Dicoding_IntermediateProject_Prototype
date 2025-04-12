import AddStoryPresenter from "./add-story-presenter";

export default class AddStoryPage {
  constructor() {
    this.presenter = new AddStoryPresenter(this);
    this.videoElement = null;
    this.capturedImageBlob = null;
  }

  async render() {
    return `      
      <a href="#main-content" class="skip-to-content">Langsung ke konten</a>
      <section class="container" id="main-content">
        <h1>Tambah Story</h1>
        <form id="add-story-form">
          <label for="description">Deskripsi</label>
          <textarea id="description" name="description" required></textarea>
          
          <div class="photo-input-container">
            <label>Foto</label>
            <div class="photo-options">
              <div class="option">
                <input type="radio" id="upload-option" name="photo-source" value="upload" checked>
                <label for="upload-option">Upload File</label>
              </div>
              <div class="option">
                <input type="radio" id="camera-option" name="photo-source" value="camera">
                <label for="camera-option">Ambil dari Kamera</label>
              </div>
            </div>
            
            <div id="upload-container">
              <input type="file" id="photo" name="photo" accept="image/*">
            </div>
            
            <div id="camera-container" class="camera-container" style="display: none;">
              <video id="camera-preview"></video>
              <button type="button" id="capture-btn" class="camera-button">
                <i class="fas fa-camera"></i> Ambil Foto
              </button>
            </div>
            
            <div id="preview-container" style="display: none;">
              <img id="photo-preview" alt="Preview foto">
              <button type="button" id="retake-btn">Ambil Ulang</button>
            </div>
          </div>
          
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
    this._initMap();
    this._initFormElements();
    this._initEventListeners();
  }

  _initMap() {
    const map = new L.Map("map").setView([0, 0], 2);

    // Tile layer OpenStreetMap
    const osm = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }
    ).addTo(map);

    // Tile layer MapTiler
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

    // Handle map clicks for location selection
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
  }

  _initFormElements() {
    this.form = document.querySelector("#add-story-form");
    this.photoInput = document.getElementById("photo");
    this.uploadContainer = document.getElementById("upload-container");
    this.cameraContainer = document.getElementById("camera-container");
    this.previewContainer = document.getElementById("preview-container");
    this.photoPreview = document.getElementById("photo-preview");

    // Handle photo input change
    this.photoInput.addEventListener("change", () => {
      if (this.photoInput.files && this.photoInput.files[0]) {
        this._showImagePreview(URL.createObjectURL(this.photoInput.files[0]));
      }
    });
  }

  _initEventListeners() {
    // Photo source selection
    document.querySelectorAll('input[name="photo-source"]').forEach((radio) => {
      radio.addEventListener("change", () => this._togglePhotoInputMethod());
    });

    // Capture button
    document
      .getElementById("capture-btn")
      .addEventListener("click", async () => {
        this.capturedImageBlob = await this.presenter.capturePhoto(
          this.videoElement
        );
        const imageUrl = URL.createObjectURL(this.capturedImageBlob);
        this._showImagePreview(imageUrl);
      });

    // Retake button
    document.getElementById("retake-btn").addEventListener("click", () => {
      this.capturedImageBlob = null;
      this._resetPhotoSelection();
    });

    // Form submission
    this.form.addEventListener("submit", async (event) => {
      event.preventDefault();

      // Validate and collect form data
      const formData = {
        description: this.form.description.value,
        lat: this.form.lat.value,
        lon: this.form.lon.value,
        token: localStorage.getItem("token"),
      };

      // Add photo data (either from file input or captured photo)
      const photoSource = document.querySelector(
        'input[name="photo-source"]:checked'
      ).value;
      if (photoSource === "upload" && this.photoInput.files[0]) {
        formData.photo = this.photoInput.files[0];
      } else if (photoSource === "camera" && this.capturedImageBlob) {
        formData.photo = new File([this.capturedImageBlob], "photo.jpg", {
          type: "image/jpeg",
        });
      } else {
        alert("Harap pilih atau ambil foto terlebih dahulu");
        return;
      }

      // Check if token exists
      if (!formData.token) {
        window.location.hash = "/login";
        return;
      }

      // Submit using presenter
      await this.presenter.submitStory(formData);
    });
  }

  _togglePhotoInputMethod() {
    const selectedSource = document.querySelector(
      'input[name="photo-source"]:checked'
    ).value;

    if (selectedSource === "upload") {
      this.uploadContainer.style.display = "block";
      this.cameraContainer.style.display = "none";
      this.videoElement?.pause();
    } else {
      this.uploadContainer.style.display = "none";
      this.cameraContainer.style.display = "block";
      this.presenter.initCamera();
    }

    // Reset preview when switching methods
    this.previewContainer.style.display = "none";
  }

  _showImagePreview(imageUrl) {
    this.photoPreview.src = imageUrl;
    this.uploadContainer.style.display = "none";
    this.cameraContainer.style.display = "none";
    this.previewContainer.style.display = "block";

    // Stop camera stream if it was active
    if (this.videoElement && this.videoElement.srcObject) {
      const tracks = this.videoElement.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    }
  }

  _resetPhotoSelection() {
    const selectedSource = document.querySelector(
      'input[name="photo-source"]:checked'
    ).value;

    this.previewContainer.style.display = "none";

    if (selectedSource === "upload") {
      this.uploadContainer.style.display = "block";
      this.photoInput.value = "";
    } else {
      this.cameraContainer.style.display = "block";
      this.presenter.initCamera();
    }
  }

  showCameraPreview(stream) {
    this.videoElement = document.getElementById("camera-preview");
    this.videoElement.srcObject = stream;
    this.videoElement.play();
  }

  showError(message) {
    alert(message);
  }

  redirectToHome() {
    window.location.hash = "/";
  }
}
