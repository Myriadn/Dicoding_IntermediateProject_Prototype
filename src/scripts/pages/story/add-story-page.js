import AddStoryPresenter from "./add-story-presenter";
import NavigationHelper from "../../utils/navigation-helper";

export default class AddStoryPage {
  constructor() {
    this.presenter = new AddStoryPresenter(this);
    this.videoElement = null;
    this.capturedImageBlob = null;
    this.isCameraMode = false;
  }

  async render() {
    return `      
      <section class="container" id="main-content">
        <h1>Tambah Story</h1>
        <form id="add-story-form">
          <div class="form-group">
            <label for="description">Deskripsi</label>
            <textarea id="description" name="description" required></textarea>
          </div>
          
          <div class="photo-input-container">
            <label>Foto</label>
            <div class="photo-actions">
              <input type="file" id="photo" name="photo" accept="image/*" class="file-input">
              <button type="button" id="camera-btn" class="camera-toggle-btn">
                <i class="fas fa-camera"></i> Gunakan Kamera
              </button>
            </div>
            
            <div id="camera-container" class="camera-container" style="display: none;">
              <video id="camera-preview" class="camera-preview"></video>
              <button type="button" id="capture-btn" class="camera-button">
                <i class="fas fa-camera"></i> Ambil Foto
              </button>
              <button type="button" id="close-camera-btn" class="camera-close-btn">
                <i class="fas fa-times"></i> Tutup Kamera
              </button>
            </div>
            
            <div id="preview-container" style="display: none;">
              <img id="photo-preview" alt="Preview foto">
              <button type="button" id="retake-btn" class="retake-btn">Ambil Ulang</button>
            </div>
          </div>
          
          <div class="form-group">
            <label for="map">Pilih Lokasi di Peta (Opsional)</label>
            <p class="map-instructions">Klik pada peta untuk menentukan lokasi story Anda</p>
            <div id="map" style="height: 300px; margin-top: 10px;"></div>
            <input type="hidden" id="lat" name="lat">
            <input type="hidden" id="lon" name="lon">
          </div>
          
          <button type="submit">Tambah Story</button>
        </form>
      </section>
    `;
  }

  async afterRender() {
    // Menggunakan NavigationHelper untuk pengaturan navigasi
    NavigationHelper.setupAuthenticatedNavigation();

    this._initMap();
    this._initFormElements();
    this._initEventListeners();

    // Add event to ensure camera is stopped when navigating away
    window.addEventListener("hashchange", () => this.stopCameraStream());
    window.addEventListener("beforeunload", () => this.stopCameraStream());
  }

  _initMap() {
    const mapElement = document.getElementById("map");
    if (!mapElement) return;

    try {
      const map = new L.Map("map").setView([0, 0], 2);

      // Tile layer OpenStreetMap
      const osm = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }
      ).addTo(map);

      // Layer control
      const baseMaps = {
        OpenStreetMap: osm,
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

          // Tampilkan info lokasi yang dipilih
          marker.bindPopup("Lokasi story Anda").openPopup();
        }
        document.getElementById("lat").value = lat;
        document.getElementById("lon").value = lng;
      });

      // Coba untuk mendapatkan lokasi terakhir yang diketahui
      this._tryGetApproximateLocation(map);
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  }

  _tryGetApproximateLocation(map) {
    // Coba dapatkan lokasi perkiraan dari IP atau data cache
    // Tanpa meminta izin khusus dari pengguna
    try {
      // Gunakan posisi Indonesia sebagai posisi default
      map.setView([-0.7893, 113.9213], 5);
    } catch (error) {
      console.log("Could not set default location:", error);
    }
  }

  _initFormElements() {
    this.form = document.querySelector("#add-story-form");
    this.photoInput = document.getElementById("photo");
    this.cameraBtn = document.getElementById("camera-btn");
    this.closeCameraBtn = document.getElementById("close-camera-btn");
    this.cameraContainer = document.getElementById("camera-container");
    this.previewContainer = document.getElementById("preview-container");
    this.photoPreview = document.getElementById("photo-preview");

    // Handle photo input change
    if (this.photoInput) {
      this.photoInput.addEventListener("change", () => {
        if (this.photoInput.files && this.photoInput.files[0]) {
          this._showImagePreview(URL.createObjectURL(this.photoInput.files[0]));
        }
      });
    }
  }

  _initEventListeners() {
    // Camera button
    if (this.cameraBtn) {
      this.cameraBtn.addEventListener("click", () => {
        this.isCameraMode = true;
        this.photoInput.style.display = "none";
        this.cameraBtn.style.display = "none";
        this.cameraContainer.style.display = "block";
        this.presenter.initCamera();
      });
    }

    // Close camera button
    if (this.closeCameraBtn) {
      this.closeCameraBtn.addEventListener("click", () => {
        this.isCameraMode = false;
        this.photoInput.style.display = "block";
        this.cameraBtn.style.display = "inline-block";
        this.cameraContainer.style.display = "none";
        this.stopCameraStream();
      });
    }

    // Capture button
    const captureBtn = document.getElementById("capture-btn");
    if (captureBtn) {
      captureBtn.addEventListener("click", async () => {
        this.capturedImageBlob = await this.presenter.capturePhoto(
          this.videoElement
        );
        const imageUrl = URL.createObjectURL(this.capturedImageBlob);
        this._showImagePreview(imageUrl);
      });
    }

    // Retake button
    const retakeBtn = document.getElementById("retake-btn");
    if (retakeBtn) {
      retakeBtn.addEventListener("click", () => {
        this.capturedImageBlob = null;
        this.previewContainer.style.display = "none";

        if (this.isCameraMode) {
          this.cameraContainer.style.display = "block";
          this.presenter.initCamera();
        } else {
          this.photoInput.style.display = "block";
          this.cameraBtn.style.display = "inline-block";
          this.photoInput.value = "";
        }
      });
    }

    // Form submission
    if (this.form) {
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
        if (this.capturedImageBlob) {
          formData.photo = new File([this.capturedImageBlob], "photo.jpg", {
            type: "image/jpeg",
          });
        } else if (this.photoInput.files && this.photoInput.files[0]) {
          formData.photo = this.photoInput.files[0];
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
  }

  _showImagePreview(imageUrl) {
    if (!this.photoPreview || !this.previewContainer) return;

    this.photoPreview.src = imageUrl;
    this.photoInput.style.display = "none";
    this.cameraBtn.style.display = "none";
    this.cameraContainer.style.display = "none";
    this.previewContainer.style.display = "block";

    // Stop camera stream if it was active
    this.stopCameraStream();
  }

  showCameraPreview(stream) {
    this.videoElement = document.getElementById("camera-preview");
    if (this.videoElement) {
      this.videoElement.srcObject = stream;
      this.videoElement.play();
    }
  }

  // Ensure camera is always stopped when navigating away
  stopCameraStream() {
    if (this.videoElement && this.videoElement.srcObject) {
      const tracks = this.videoElement.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      this.videoElement.srcObject = null;
    }
  }

  showError(message) {
    alert(message);
  }

  redirectToHome() {
    this.stopCameraStream(); // Stop camera before redirecting
    window.location.hash = "/";
  }
}
