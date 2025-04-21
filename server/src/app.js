import express, { json } from "express";
import cors from "cors";
import morgan from "morgan";
import { createServer } from "http";
import compression from "compression";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import passport from "passport";
import "./lib/passport.js"
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";

//routes
import authRoutes from "./routes/user.js";
import googleRoutes from "./routes/google.js";
import postRoutes from "./routes/post.js";
import commentRoutes from "./routes/comment.js";
import storyRoutes from "./routes/story.js";

const app = express();
const httpServer = createServer(app);

const corsOptions = {
  origin: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PATCH", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));

// app.use(
//   session({
//     store: new RedisStore({ client: redisClient }),
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       httpOnly: true,
//       secure: false,
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     },
//   })
// );
app.use(passport.initialize());
// app.use(passport.session());
app.use(morgan("dev"));
app.use(compression());
app.use(cookieParser());
// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         scriptSrc: ["'self'", "trusted-scripts.com"],
//         objectSrc: ["'none'"],
//         upgradeInsecureRequests: [],
//       },
//     },
//     frameguard: {
//       action: "deny",
//     },
//     referrerPolicy: {
//       policy: "no-referrer",
//     },
//   })
// );
app.use(json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

app.disable("x-powered-by");
//test api route
app.get("/", (req, res) => {
  res.send("Hello express");
});

//api app endpoints
app.use("/api/auth", authRoutes);
app.use("/auth/google", googleRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/stories", storyRoutes);

// Handle all errors
app.use(notFoundHandler); //route error handler
app.use(errorHandler); //error handler

export { httpServer };
