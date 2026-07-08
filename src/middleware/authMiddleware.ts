import { NextFunction, Request, Response } from "express";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.session.adminId) {
    res.redirect("/login");
    return;
  }

  next();
};

export const redirectIfAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.session.adminId) {
    res.redirect("/admin/dashboard");
    return;
  }

  next();
};