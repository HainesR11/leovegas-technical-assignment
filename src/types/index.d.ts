declare namespace Express {
  interface Request extends Express.Request {
    user?: {
      userId?: number;
      name?: string;
      email?: string;
      role?: "Admin" | "User";
    } | null;
  }
}
