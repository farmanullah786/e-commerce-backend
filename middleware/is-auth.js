const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const token = req.header("Authorization").replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Unauthorized", statusCode: 401 });
  }

  jwt.verify(token, "malakfarmankhan786", (err, user) => {
    if (err) {
      return res.status(401).json({ message: "Your has been expired!", statusCode: 401 });
    }
    req.user = {
      _id:user.userId,
      name:user.name,
      email:user.email,
      image:user.image,
    }

    next();
  });
}

module.exports = authenticateToken;
