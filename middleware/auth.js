import jwt from "jsonwebtoken"

const auth = (req, res, next) => {

    const { authorization } = req.headers;
    if (!authorization) return res.status(401).json({ message: "you are not authorized" })

    const token = authorization.split(" ")[1]
    
    jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
        if (error) return res.status(403).json({ message: "token is not valid" })
       
        req.user = user;

        next();
    })
}


export default auth;