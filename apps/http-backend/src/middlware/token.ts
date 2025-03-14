import { NextFunction, Response } from "express";
import { RequestCustom } from "../../types/express"; 
import jwt from "jsonwebtoken";
import 'dotenv/config';

export function tokenValidation(req: RequestCustom, res: Response, next: NextFunction) {
    const token = req.headers['authorization'] ?? "";

    jwt.verify(token, process.env.JWT_SECRET || '', (err: any, decoded: any) => {
        if(err) {
            // console.log(err);
            return res.status(500).json({ message: 'Invalid token', error: err})
        }
        if(!decoded) {
            return res.status(403).json({message: 'Unauthorized'});
        }
        req.userid = decoded.userid
        return next()
    });
}