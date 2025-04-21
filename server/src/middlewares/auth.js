import passport from "passport"
import { AppError } from './errorHandler.js';

export const authenticate = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(new AppError('Unauthorized! You are unathenticated', 401));
    }
    req.user = user;
    next();
  })(req, res, next);
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Unauthorized for this role', 403));
    }
    next();
  };
};