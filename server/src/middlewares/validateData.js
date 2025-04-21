import { ZodError } from "zod";

export function validateData(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((issue) => ({
          message: `${issue.path.join(".")} is ${issue.message}`,
        }));
        res
          .status(400)
          .json({ error: "Validation failed", details: errorMessages });
      } else {
        res
          .status(error.status || 500)
          .json({ error: error.message || "Internal Server Error" });
      }
    }
  };
}
