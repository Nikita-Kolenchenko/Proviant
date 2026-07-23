import nodemailer from "nodemailer";
import { transporter } from "./transporter.js";

export const sendVerificationEmail = async (email, code) => {
  try {
    // Send a message
    await transporter.sendMail({
      from: `"Proviant" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Код підтвердження реєстрації в Proviant",
      html: `
      <div
  style="
    font-family: sans-serif;
    margin: 0 auto;
    padding: 20px;
    border-radius: 20px;
    text-align: center;
    border: 1px solid rgba(68, 71, 70, 0.54);
    max-width: 500px; /* Чтобы письмо не растягивалось на весь экран компьютера */
  "
>
  <img
    src="https://i.postimg.cc/vB0ZN1XS/Proviant.png"
    alt="Proviant"
    style="
      width: 70px;
      height: 70px;
      margin: 0 auto 20px auto;
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
    Ласкаво просимо до Proviant!
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
      margin: 40px auto; 
      border-radius: 12px;
      color: #1f1f1f;
      width: max-content;
    "
  >
    ${code}
  </div>

  <p style="font-size: 12px; color: #444746; margin: 0 0 4px 0;">
    Код дійсний протягом 4 хвилин.
  </p>
  <p style="font-size: 12px; color: #444746; margin: 0;">
    Якщо ви не реєструвалися на нашому сайті, просто ігноруйте цей лист.
  </p>
</div>
    `,
    });
  } catch (error) {
    console.error("КРИТИЧЕСКАЯ ОШИБКА ПОЧТЫ:", error);
    throw new Error(
      "Сталася помилка при відправці листа. Будь ласка, спробуйте ще раз пізніше.",
    );
  }
};
