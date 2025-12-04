import { signToken, verifyToken, getTokenFromRequest } from "../jwt";

describe("JWT Utilities", () => {
  const originalEnv = process.env.JWT_SECRET;

  beforeAll(() => {
    process.env.JWT_SECRET = "test-secret-key";
  });

  afterAll(() => {
    process.env.JWT_SECRET = originalEnv;
  });

  describe("signToken", () => {
    it("should sign a token with user payload", () => {
      const payload = { userId: "123", email: "test@example.com" };
      const token = signToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe("verifyToken", () => {
    it("should verify a valid token", () => {
      const payload = { userId: "123", email: "test@example.com" };
      const token = signToken(payload);
      const verified = verifyToken(token);

      expect(verified.userId).toBe(payload.userId);
      expect(verified.email).toBe(payload.email);
    });

    it("should throw error for invalid token", () => {
      expect(() => {
        verifyToken("invalid.token.here");
      }).toThrow("Invalid or expired token");
    });

    it("should throw error for empty token", () => {
      expect(() => {
        verifyToken("");
      }).toThrow("Invalid or expired token");
    });
  });

  describe("getTokenFromRequest", () => {
    it("should extract token from Bearer header", () => {
      const req = {
        headers: {
          authorization: "Bearer test-token-123",
        },
      };

      const token = getTokenFromRequest(req);
      expect(token).toBe("test-token-123");
    });

    it("should return null if no authorization header", () => {
      const req = {
        headers: {},
      };

      const token = getTokenFromRequest(req);
      expect(token).toBeNull();
    });

    it("should return null if header doesn't start with Bearer", () => {
      const req = {
        headers: {
          authorization: "Basic token",
        },
      };

      const token = getTokenFromRequest(req);
      expect(token).toBeNull();
    });
  });
});
