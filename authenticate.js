const jwt = require("jsonwebtoken");
module.exports = (req, res, next) => {
   const token = req.headers.authorization;

   if (token) {
      jwt.verify(token, process.env.tokenSecret, (err, decoded) => {
         if (err) {
            // unauthorized

            return res
               .status(401)
               .send({ error: true, msg: "Unauthorized user" });
         }
         req.decoded = decoded;
         next();
      });
   } else {
      res.status(401).send({ error: true, msg: "Token not provided" });
   }
};
