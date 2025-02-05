import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import { User } from '../models/user.model.js';
export const protect = asyncHandler(async (req, res, next) => {
    console.log('in protect')
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        try{
            token = req.headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token, process.env.JWT_SECRETE)
            req.user = await User.findById(decoded.id).select('-password')
            next()
        }catch(error){
            res.status(400).json({error:error})
        }
    }
    if(!token){
        res.status(401).json({error:'Not authorized, no token'})
    }
})