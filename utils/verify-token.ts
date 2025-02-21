import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";

// Extend the Request interface to include the user property
declare module "express-serve-static-core" {
  interface Request {
    user?: { username: string };
  }
}

const verifyToken = (
  req: Request,
  res: Response,
  next: express.NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    // do nothing since we want it to be optional
    next();
    return;
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET as string);
    const decoded = jwt.decode(token) as { username?: string };
    if (decoded && decoded.username) {
      req.user = { username: decoded.username };
    }
    next();
  } catch (e) {
    res.status(401).send("Unauthorized");
  }
};

export default verifyToken;
