import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {

  //   you can also add keys like: isAdmin, isSeller into the payload and extract them when decoding the jwt
  const payload = { id: userId };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRES_IN || "7d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // prevents CSRF attacks
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  return token;
};
