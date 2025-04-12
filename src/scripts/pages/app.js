import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener("click", () => {
      this.#navigationDrawer.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove("open");
      }

      this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove("open");
        }
      });
    });
  }

  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url];

    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        // Fade-out halaman lama
        await this.#content.animate({ opacity: [1, 0] }, { easing: "ease-out" })
          .finished;

        // Ganti konten dengan halaman baru
        this.#content.innerHTML = await page.render();
        await page.afterRender();

        // Fade-in halaman baru
        this.#content.animate({ opacity: [0, 1] }, { easing: "ease-in" });
      });
    } else {
      // Fallback jika View Transition API tidak didukung
      this.#content.style.opacity = 0;
      this.#content.innerHTML = await page.render();
      await page.afterRender();
      this.#content.animate({ opacity: [0, 1] }, { easing: "ease-in" });
    }
  }
}

export default App;
