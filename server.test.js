import { jest, describe, test, expect } from "@jest/globals";
import mongoose from "mongoose";
import { connectDB } from "./src/config/db.js";
import request from "supertest";
import app from "./src/server.js";
import dotenv from "dotenv";

dotenv.config();

describe("Тестирование Auth API", () => {
  // 1. ПОДПЛЮЧАЕМСЯ К БД перед выполнением тестов
  beforeAll(async () => {
    await connectDB();
  });

  // 2. ЗАКРЫВАЕМ подключение к БД после завершения всех тестов
  afterAll(async () => {
    await mongoose.connection.close();
  });
  test("POST /api/auth/register - проверка ответа", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "test@example.com",
      username: "testuser",
      password: "password123",
    });

    console.log("Статус:", response.statusCode);
    console.log("Тело ответа:", response.body);

    expect(response.statusCode).toBe(201);
  });
});
