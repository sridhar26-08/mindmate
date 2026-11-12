import jwt from 'jsonwebtoken'; import { User } from '../models/index.js';
export async function protect(req,res,next){ const token=req.headers.authorization?.split(' ')[1]; if(!token) return res.status(401).json({message:'Authentication required'}); try { const data=jwt.verify(token,process.env.JWT_SECRET); req.user=await User.findById(data.id); if(!req.user) throw Error(); next(); } catch { res.status(401).json({message:'Invalid or expired token'}); } }
export const adminOnly=(req,res,next)=>req.user?.role==='admin'?next():res.status(403).json({message:'Admin access required'});
