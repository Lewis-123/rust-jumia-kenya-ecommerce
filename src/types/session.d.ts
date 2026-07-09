import "express-session";

declare module "express-session" {
  interface SessionData {
    adminId?: string;
    adminName?: string;
    pendingAdminId?: string;
    successMessage?: string;
    errorMessage?: string;
  }
}