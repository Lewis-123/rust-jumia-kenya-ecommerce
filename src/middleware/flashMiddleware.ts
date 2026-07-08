import { NextFunction, Request, Response } from "express";

export const flashMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.locals.successMessage = req.session.successMessage || null;
  res.locals.errorMessage = req.session.errorMessage || null;

  delete req.session.successMessage;
  delete req.session.errorMessage;

  next();
};