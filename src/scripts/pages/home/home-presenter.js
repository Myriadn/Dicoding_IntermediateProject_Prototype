// src/scripts/pages/home/home-presenter.js
import { getStories } from "../../data/api";

export default class HomePresenter {
  constructor(view) {
    this.view = view; // Inject View dependency
  }

  // Ambil data dari Model & update View
  async loadStories() {
    try {
      const token = localStorage.getItem("token");
      const response = await getStories(token);

      if (!response.error) {
        this.view.displayStories(response.listStory); // Update View
      } else {
        this.view.showError(response.message); // Tampilkan error di View
      }
    } catch (error) {
      this.view.showError("Gagal memuat data"); // Handle network error
    }
  }
}
