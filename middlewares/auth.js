// middlewares/auth.js
const basicAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    res.setHeader("WWW-Authenticate", "Basic");
    return res.status(401).json({ message: "Missing Authorization Header" });
  }

  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "ascii"
  );
  const [username, password] = credentials.split(":");

  const validUsername = "admin";
  const validPassword = "password";

  if (username === validUsername && password === validPassword) {
    return next();
  } else {
    return res
      .status(401)
      .json({ message: "Invalid Authentication Credentials" });
  }
};

module.exports = basicAuth;
