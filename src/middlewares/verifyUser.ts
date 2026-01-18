import { NextFunction, Request, Response } from "express";
import Joi from "joi";

const registerSiswaSchema = Joi.object({
    username: Joi.string().required(),        
    password: Joi.string().min(3).required(), 
    role: Joi.string().valid('siswa').default('siswa').optional(),


    nama_siswa: Joi.string().required(),
    alamat: Joi.string().required(),
    telp: Joi.string().required(),
    foto: Joi.any().optional(), 
    user: Joi.forbidden()
});


const registerAdminStanSchema = Joi.object({
    username: Joi.string().required(),            
    password: Joi.string().min(3).required(),      
    role: Joi.string().valid('admin_stan').default('admin_stan').optional(),                             
    nama_stan: Joi.string().required(),          
    nama_pemilik: Joi.string().required(),        
    telp: Joi.string().required(),                 

    user: Joi.forbidden()                         
});


const registerUserStanSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().min(3).alphanum().required(),
    role: Joi.string().valid('siswa', 'admin_stan').uppercase().required(),
    user: Joi.optional()
});


const editUserSchema = Joi.object({
    username: Joi.string().optional(),        
    password: Joi.string().min(3).optional(), 

    nama_stan: Joi.string().optional(),
    nama_pemilik: Joi.string().optional(),
    telp: Joi.string().optional(),
    user: Joi.forbidden()
});

const editUserSiswa = Joi.object({
    username: Joi.string().optional(),        
    password: Joi.string().min(3).optional(), 

    nama_siswa: Joi.string().optional(),
    alamat: Joi.string().optional(),
    telp: Joi.string().optional(),
    foto: Joi.any().optional(), 
    user: Joi.forbidden()
});


export const verifyRegisterSiswa = (req: Request, res: Response, next: NextFunction) => {
    const { error } = registerSiswaSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join(", ")
        });
    }
    next();
};

export const verifyRegisterAdminStan = (req: Request, res: Response, next: NextFunction) => {
    const { error } = registerAdminStanSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join(", ")
        });
    }
    next();
};

export const verifyEditUser = (req: Request, res: Response, next: NextFunction) => {
    const { error } = editUserSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join(", ")
        });
    }
    next();
};
export const verifyEditUserSiswa = (req: Request, res: Response, next: NextFunction) => {
    const { error } = editUserSiswa.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join(", ")
        });
    }
    next();
};
