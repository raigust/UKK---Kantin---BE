import Joi from "joi";
import { Request, Response, NextFunction } from "express";

const registerStanSchema = Joi.object({
    nama_stan: Joi.string().required(),
    nama_pemilik: Joi.string().required(),
    telp: Joi.string().max(20).required(),
    
    user: Joi.forbidden()
});


const updateStanSchema = Joi.object({
    nama_stan: Joi.string().optional(),
    nama_pemilik: Joi.string().optional(),
    telp: Joi.string().max(20).optional()
});

export const verifyRegisterStan = (req: Request, res: Response, next: NextFunction) => {
    const { error } = registerStanSchema.validate(req.body);

    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details[0].message
        });
    }

    next();
};

export const verifyUpdateStan = (req: Request, res: Response, next: NextFunction) => {
    const { error } = updateStanSchema.validate(req.body);

    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details[0].message
        });
    }

    next();
};
