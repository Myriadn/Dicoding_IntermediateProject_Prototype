import { login } from "../../data/api";
import NavigationHelper from "../../utils/navigation-helper";

export default class LoginPage {
  async render() {
    return `
      <section class="auth-container" id="main-content">
        <div class="auth-card">
          <h1>Login</h1>
          <form id="login-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" required>
            </div>
            <div class="form-actions">
              <button type="submit">Login</button>
              <span>Belum punya akun? <a href="#/register">Daftar</a></span>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Menggunakan NavigationHelper untuk pengaturan navigasi
    NavigationHelper.setupUnauthenticatedNavigation();

    const form = document.querySelector("#login-form");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = form.email.value;
      const password = form.password.value;
      const response = await login({ email, password });
      if (!response.error) {
        localStorage.setItem("token", response.loginResult.token);
        localStorage.setItem("userName", response.loginResult.name);
        window.location.hash = "/";
      } else {
        alert(response.message);
      }
    });
  }
}
