import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { PrismaClient } from "@prisma/client";
import { generateTokens } from "./jwt.js";
import { sendMail } from "./email.js";
import { AppError } from "../middlewares/errorHandler.js";

const prisma = new PrismaClient();

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(options, async (jwt_payload, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: jwt_payload.id },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
        },
      });

      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      console.error("JWT Strategy Error:", error);
      return done(error, false);
    }
  })
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findUnique({
          where: { googleId: profile.id },
        });
        if (!user) {
          user = await prisma.user.create({
            data: {
              email: profile.emails[0].value,
              username: profile.displayName,
              role: "USER",
              fullname: profile.displayName,
              isVerified: true,
              googleId: profile.id,
              profilePicture: profile.photos[0].value || "",
            },
          });
          await sendMail({
            fullname: user.fullname,
            intro: ["Instashots", "We're very excited to have you on board."],
            subject: "Welcome to Instashots",
            to: user.email,
          });
        }
        const { accessToken, refreshToken } = generateTokens(user);
        done(null, { user, accessToken, refreshToken });
      } catch (error) {
        console.error("Error during Google authentication:", error);
        done(error, null);
        throw new AppError("Error during Google authentication", 500);
      }
    }
  )
);

// Serialize user to store in session
passport.serializeUser((user, done) => {
  // console.log("serializing user", user);
  if (!user || !user.id) {
    return done(new Error("User not found"), null);
  }
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
