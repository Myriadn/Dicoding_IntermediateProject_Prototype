import { register } from "../../data/api";

export default class RegisterPage {
  async render() {
    return `
      <a href="#main-content" class="skip-to-content">Skip to content</a>
      <section class="container" id="main-content">
        <h1>Register</h1>
        <form id="register-form">
          <label for="name">Nama</label>
          <input type="text" id="name" name="name" required aria-describedby="name-help">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" required>
          <label for="password">Password</label>
          <input type="password" id="password" name="password" minlength="8" required>
          <button type="submit">Register</button>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const form = document.querySelector("#register-form");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const name = form.name.value;
      const email = form.email.value;
      const password = form.password.value;
      const response = await register({ name, email, password });
      if (!response.error) {
        alert("Registrasi berhasil! Silakan login.");
        window.location.hash = "/login";
      } else {
        alert(response.message);
      }
    });
  }
}
