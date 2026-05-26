import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import userRouter from "../routes/user";
import { Pool } from "pg";
import authMiddleware from "../middleware/authentication";
import {
  jest,
  describe,
  afterEach,
  it,
  expect,
  beforeAll,
} from "@jest/globals";

jest.mock("pg", () => {
  const mPool = {
    connect: function () {
      return { query: jest.fn() };
    },
    query: jest.fn(),
    end: jest.fn(),
    on: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use(authMiddleware);
  app.use("/api/v1/users", userRouter);
  return app;
};

const mockUser = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
  password: "hashedpassword",
  role: "User",
  created_at: "2024-01-01T00:00:00.000Z",
};

describe("User Routes - /api/v1/users", () => {
  let app: express.Express;
  let pool: any;
  let token: string;

  beforeAll(() => {
    app = buildApp();
    pool = new Pool();
    token = jwt.sign(
      { userId: mockUser.id, role: mockUser.role },
      "default_secret",
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /", () => {
    it("should return all users", async () => {
      pool.query.mockResolvedValue({ rows: [mockUser] });

      const res = await request(app)
        .get("/api/v1/users")
        .set("x-auth-token", token);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([
        { ...mockUser, created_at: mockUser.created_at },
      ]);
      expect(pool.query).toHaveBeenCalledWith(
        "SELECT id, name, email, role, created_at FROM users",
      );
    });

    it("should return 401 if no token provided", async () => {
      const res = await request(app).get("/api/v1/users");
      expect(res.status).toBe(401);
    });

    it("should return 403 if token is invalid", async () => {
      const res = await request(app)
        .get("/api/v1/users")
        .set("x-auth-token", "invalidtoken");
      expect(res.status).toBe(403);
    });
  });

  describe("GET /:id", () => {
    it("should return user by id for admin", async () => {
      const adminToken = jwt.sign(
        { userId: 2, role: "Admin" },
        "default_secret",
      );
      pool.query.mockResolvedValue({ rows: [mockUser] });

      const res = await request(app)
        .get("/api/v1/users/1")
        .set("x-auth-token", adminToken);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        ...mockUser,
        created_at: mockUser.created_at,
      });
      expect(pool.query).toHaveBeenCalledWith(
        "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
        ["1"],
      );
    });

    it("should return user by id for the user themselves", async () => {
      pool.query.mockResolvedValue({ rows: [mockUser] });

      const res = await request(app)
        .get("/api/v1/users/1")
        .set("x-auth-token", token);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        ...mockUser,
        created_at: mockUser.created_at,
      });
      expect(pool.query).toHaveBeenCalledWith(
        "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
        ["1"],
      );
    });

    it("should return 403 if user tries to access another user's data", async () => {
      const res = await request(app)
        .get("/api/v1/users/2")
        .set("x-auth-token", token);

      expect(res.status).toBe(403);
    });

    it("should return 404 if user not found", async () => {
      const adminToken = jwt.sign(
        { userId: mockUser.id, role: "Admin" },
        "default_secret",
      );
      pool.query.mockResolvedValue({ rows: [] });

      const res = await request(app)
        .get("/api/v1/users/999")
        .set("x-auth-token", adminToken);

      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /:id", () => {
    it("should update user by id for admin", async () => {
      const adminToken = jwt.sign(
        { userId: 2, role: "Admin" },
        "default_secret",
      );
      const updatedUser = { ...mockUser, name: "Alice Updated" };
      pool.query.mockResolvedValue({ rows: [updatedUser] });

      const res = await request(app)
        .patch("/api/v1/users/1")
        .set("x-auth-token", adminToken)
        .send({ ...mockUser, name: "Alice Updated" });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        ...updatedUser,
        created_at: mockUser.created_at,
      });
    });

    it("should update user by id for the user themselves", async () => {
      const updatedUser = { ...mockUser, name: "Alice Updated" };
      pool.query.mockResolvedValue({ rows: [updatedUser] });

      const res = await request(app)
        .patch("/api/v1/users/1")
        .set("x-auth-token", token)
        .send({ ...mockUser, name: "Alice Updated" });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        ...updatedUser,
        created_at: mockUser.created_at,
      });
    });

    it("should return 403 if user tries to update another user's data", async () => {
      const res = await request(app)
        .patch("/api/v1/users/2")
        .set("x-auth-token", token)
        .send({ ...mockUser, name: "Alice Updated" });

      expect(res.status).toBe(403);
    });

    it("should return 404 if user not found", async () => {
      const adminToken = jwt.sign(
        { userId: mockUser.id, role: "Admin" },
        "default_secret",
      );

      pool.query.mockResolvedValue({ rows: [] });

      const res = await request(app)
        .patch("/api/v1/users/999")
        .set("x-auth-token", adminToken)
        .send({ ...mockUser, name: "Alice Updated" });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /:id", () => {
    it("should delete user by id for admin", async () => {
      const adminToken = jwt.sign(
        { userId: 2, role: "Admin" },
        "default_secret",
      );
      pool.query.mockResolvedValue({ rows: [{ id: 1 }] });

      const res = await request(app)
        .delete("/api/v1/users/1")
        .set("x-auth-token", adminToken);

      expect(res.status).toBe(200);
    });

    it("should return 403 if user tries to delete themselves", async () => {
      const res = await request(app)
        .delete("/api/v1/users/1")
        .set("x-auth-token", token);

      expect(res.status).toBe(403);
    });

    it("should return 403 if user tries to delete another user's data", async () => {
      const res = await request(app)
        .delete("/api/v1/users/2")
        .set("x-auth-token", token);

      expect(res.status).toBe(403);
    });

    it("should return 404 if user not found", async () => {
      const adminToken = jwt.sign(
        { userId: mockUser.id, role: "Admin" },
        "default_secret",
      );

      pool.query.mockResolvedValue({ rows: [] });

      const res = await request(app)
        .delete("/api/v1/users/999")
        .set("x-auth-token", adminToken);

      expect(res.status).toBe(404);
    });
  });
});
