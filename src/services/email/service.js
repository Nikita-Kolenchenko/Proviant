import nodemailer from "nodemailer";
import { transporter } from "./transporter.js";

export const sendMessage = async (email, message) => {
  try {
    // Send a message
    await transporter.sendMail({
      from: `"Proviant" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Захист акаунта Proviant.`,
      html: `
      <div
      style="
        font-family: sans-serif;
        margin: 0 auto;
        padding: 20px;
        border-radius: 20px;
        text-align: center;
        border: 1px solid rgba(68, 71, 70, 0.54);
        max-width: 500px;
      "
    >
      <img
        src="https://i.postimg.cc/vB0ZN1XS/Proviant.png"
        alt="Proviant"
        style="
          width: 70px;
          height: 70px;
          margin: 0 auto 10px auto;
          border-radius: 50%;
          border: 1px solid rgba(68, 71, 70, 0.54);
          display: block;
        "
      />
      <h2
    style="
      color: #1f1f1f;
      margin: 0 0 6px 0;
      font-weight: 600;
      letter-spacing: 1px;
    "
  >
    Proviant вітає!
  </h2>
      <h3
        style="
          color: #1f1f1f;
          margin: 50px 0 50px 0;
          font-weight: 500;
          letter-spacing: 1px;
        "
      >
        ${message}
      </h3>
      <p style="font-size: 12px; color: #444746; margin: 0">
        Якщо це були не ви — краще підстрахуватися. Змініть пароль у налаштуваннях профілю, щоб акаунт залишався в безпеці.
      </p>
      <button
        style="
          background-color: #8a38f5;
          color: #fff;
          border: none;
          padding: 10px 20px;
          border-radius: 12px;
          cursor: pointer;
          margin-top: 10px;
        "
      >
        Змінити пароль зараз >
      </button>
    </div>
    `,
    });
  } catch (error) {
    console.error("Критична помилка при відправці листа:", error);
    throw new Error(
      "Сталася помилка при відправці листа. Будь ласка, спробуйте ще раз пізніше.",
    );
  }
};

export const sendCode = async (email, code) => {
  try {
    // Send a message
    await transporter.sendMail({
      from: `"Proviant" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Код підтвердження Proviant",
      html: `
      <div
  style="
    font-family: sans-serif;
    margin: 0 auto;
    padding: 20px;
    border-radius: 20px;
    text-align: center;
    border: 1px solid rgba(68, 71, 70, 0.54);
    max-width: 500px;
  "
>
  <img
    src="https://i.postimg.cc/vB0ZN1XS/Proviant.png"
    alt="Proviant"
    style="
      width: 70px;
      height: 70px;
      margin: 0 auto 10px auto;
      border-radius: 50%;
      border: 1px solid rgba(68, 71, 70, 0.54);
      display: block;
    "
  />
  
  <h2
    style="
      color: #1f1f1f;
      margin: 0 0 5px 0;
      font-weight: 600;
      letter-spacing: 1px;
    "
  >
    Proviant вітає!
  </h2>

  <p style="font-size: 14px; color: #444746; margin: 0;">
    Ваш одноразовий код для підтвердження електронної пошти:
  </p>

  <div
    style="
      background-color: #eaeaea;
      font-size: 26px;
      font-weight: bold;
      letter-spacing: 5px;
      padding: 15px 30px;
      margin: 50px auto;
      border-radius: 12px;
      color: #1f1f1f;
      width: max-content;
    "
  >
    ${code}
  </div>

  <p style="font-size: 12px; color: #444746; margin: 0 0 4px 0;">
    Код дійсний протягом 5 хвилин.
  </p>
</div>
    `,
    });
  } catch (error) {
    console.error("Критична помилка при відправці листа:", error);
    throw new Error(
      "Сталася помилка при відправці листа. Будь ласка, спробуйте ще раз пізніше.",
    );
  }
};
