import { login } from "../../data/api";

export default class LoginPage {
  async render() {
    return `
      <a href="#main-content" class="skip-to-content">Skip to content</a>
      <section class="container" id="main-content">
        <h1>Login</h1>
        <form id="login-form">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" required>
          <label for="password">Password</label>
          <input type="password" id="password" name="password" required>
          <button type="submit">Login</button>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const form = document.querySelector("#login-form");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = form.email.value;
      const password = form.password.value;
      const response = await login({ email, password });
      if (!response.error) {
        localStorage.setItem("token", response.loginResult.token);
        window.location.hash = "/";
      } else {
        alert(response.message);
      }
    });
  }
}
