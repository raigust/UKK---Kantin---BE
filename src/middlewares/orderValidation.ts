import { Request, Response, NextFunction } from "express";
import Joi from "joi";

// Schema untuk setiap item pesanan
const orderItemSchema = Joi.object({
  id_menu: Joi.number().required(),
  qty: Joi.number().min(1).required(),
});

// Schema untuk create order siswa
const createOrderSchema = Joi.object({
  id_stan: Joi.number().required(),
  pesan: Joi.array().items(orderItemSchema).min(1).required(),
});

// Schema untuk update status
const updateStatusSchema = Joi.object({
  status: Joi.string().valid("belum_dikonfirm", "dimasak", "diantar", "sampai").required(),
});

// Middleware validate create order
export const verifyCreateOrder = (req: Request,res: Response,next: NextFunction) => {
  const { error } = createOrderSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      status: false,
      message: error.details.map((d) => d.message).join(),
    });
  }
  return next();
};

// Middleware validate update status
export const verifyUpdateStatus = (req: Request,res: Response,next: NextFunction) => {
  const { error } = updateStatusSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      status: false,
      message: error.details.map((d) => d.message).join(),
    });
  }
  return next();
};
