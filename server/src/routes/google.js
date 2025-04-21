import { Router } from "express";
import passport from "passport";

const router = Router();

router.get(
  "/",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/auth/login`,
  }),
  (req, res) => {
    const accessToken = req.user.accessToken;
    const refreshToken = req.user.refreshToken;
    const redirectUrl = `${process.env.CLIENT_URL}/google-redirect?accessToken=${accessToken}`;
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });
    res.redirect(redirectUrl);
  }
);

export default router;
