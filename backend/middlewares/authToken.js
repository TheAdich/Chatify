const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config()
const authMiddleware = (req, res, next) => {
    
    const token=req.headers.authorization;

    
    if (token) {
        jwt.verify(token, process.env.JWT_KEY, async (err, decodedToken) => {
            if (err) { console.log(err); res.redirect('/api/user/login'); }
            else {
                //console.log(decodedToken);
               try {
                    const user = await User.findById(decodedToken.id);
                    req.user = user;
                    next();
                }
                catch (err) {
                    console.log(err);
                }
            }
        })
    }
    else {
        console.log('You are not authorised!');
        res.status(301).send('Not authorised redirecting...');  
    }
}
module.exports = authMiddleware;