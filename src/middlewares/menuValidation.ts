import { NextFunction, Request, Response } from "express";
import Joi from "joi";

const tambahMenuSchema = Joi.object({
  nama_makanan: Joi.string().required(),
  harga: Joi.number().positive().required(),
  jenis: Joi.string().valid("makanan", "minuman").required(),
  foto: Joi.allow().optional(),
  deskripsi: Joi.string().optional().allow(""),
});

const updateMenuSchema = Joi.object({
  nama_makanan: Joi.string().optional(),
  harga: Joi.number().positive().optional(),
  jenis: Joi.string().valid("makanan", "minuman").optional(),
  foto: Joi.allow().optional(),
  deskripsi: Joi.string().optional().allow(""),
});

const filterMenuSchema = Joi.object({
  search: Joi.string().optional(),
  jenis: Joi.string().valid("makanan", "minuman").optional(),
  harga_min: Joi.number().optional(),
  harga_max: Joi.number().optional(),
});


export const validateTambahMenu = (req: Request, res: Response, next: NextFunction) => {
  const { error } = tambahMenuSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      status: false,
      message: error.details.map((i) => i.message).join(", "),
    });
  }

  return next();
};

export const validateUpdateMenu = (req: Request, res: Response, next: NextFunction) => {
  const { error } = updateMenuSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      status: false,
      message: error.details.map((i) => i.message).join(", "),
    });
  }

  return next();
};

export const validateFilterMenu = (req: Request,res: Response,next: NextFunction) => {
  const { error } = filterMenuSchema.validate(req.query, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      status: false,
      message: error.details.map((i) => i.message).join(", "),
    });
  }

  return next();
};
