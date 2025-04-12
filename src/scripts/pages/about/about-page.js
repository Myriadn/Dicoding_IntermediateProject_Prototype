// src/scripts/pages/about-page.js
export default class AboutPage {
  async render() {
    return `
        <section class="container about-page">
          <h1>About Myriadn Story App</h1>
          <div class="github-card">
            <i class="fab fa-github"></i>
            <a href="https://github.com/myriadn" target="_blank">
              github.com/myriadn
            </a>
          </div>
        </section>
      `;
  }
}
