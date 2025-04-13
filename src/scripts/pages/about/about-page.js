// src/scripts/pages/about/about-page.js
import NavigationHelper from "../../utils/navigation-helper";

export default class AboutPage {
  async render() {
    return `
      <section class="container about-page" id="main-content">
        <h1>About Myriadn Story App</h1>
        
        <div class="about-content">
          <p>Myriadn Story App adalah platform berbagi cerita yang memungkinkan pengguna untuk membagikan momen dan pengalaman mereka melalui foto dan teks. Aplikasi ini dirancang untuk memberikan pengalaman yang menyenangkan dan intuitif bagi pengguna.</p>
        </div>
        
        <div class="about-features">
          <div class="feature-card">
            <i class="fas fa-camera"></i>
            <h3>Ambil Foto</h3>
            <p>Ambil foto secara langsung dari kamera perangkat Anda atau unggah dari galeri.</p>
          </div>
          
          <div class="feature-card">
            <i class="fas fa-map-marker-alt"></i>
            <h3>Lokasi</h3>
            <p>Tandai lokasi cerita Anda pada peta untuk berbagi tempat spesial.</p>
          </div>
          
          <div class="feature-card">
            <i class="fas fa-share-alt"></i>
            <h3>Berbagi Cerita</h3>
            <p>Bagikan cerita Anda dengan semua orang dalam komunitas.</p>
          </div>
        </div>
        
        <div class="github-card">
          <i class="fab fa-github"></i>
          <a href="https://github.com/myriadn" target="_blank">
            github.com/myriadn
          </a>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Menggunakan NavigationHelper untuk pengaturan navigasi
    NavigationHelper.setupAuthenticatedNavigation();
  }
}
