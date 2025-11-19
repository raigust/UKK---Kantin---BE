import { NextFunction, Request, Response } from "express";
import Joi from "joi";

// SCHEMA CREATE DISKON
const createDiskonSchema = Joi.object({
  nama_diskon: Joi.string().required(),
  persentase_diskon: Joi.number().min(0).max(100).required().messages({
    "number.base": "Persentase harus berupa angka.",
    "number.min": "Persentase minimal 0.",
    "number.max": "Persentase maksimal 100.",
    "any.required": "Persentase wajib diisi.",
  }),

  tanggal_awal: Joi.date().required().messages({
    "date.base": "Tanggal awal harus berupa tanggal yang valid.",
    "any.required": "Tanggal awal wajib diisi.",
  }),

  tanggal_akhir: Joi.date().required().greater(Joi.ref("tanggal_awal")).messages({
      "date.greater": "Tanggal akhir harus lebih besar dari tanggal awal.",
      "any.required": "Tanggal akhir wajib diisi.",
    }),
});

// SCHEMA UPDATE DISKON
const updateDiskonSchema = Joi.object({
  nama_diskon: Joi.string().optional(),

  persentase: Joi.number().min(0).max(100).optional().messages({
    "number.base": "Persentase harus berupa angka.",
    "number.min": "Persentase minimal 0.",
    "number.max": "Persentase maksimal 100.",
  }),

  tanggal_awal: Joi.date().optional().messages({
    "date.base": "Tanggal awal harus berupa tanggal yang valid.",
  }),

  tanggal_akhir: Joi.date().optional().greater(Joi.ref("tanggal_awal")).messages({
      "date.greater": "Tanggal akhir harus lebih besar dari tanggal awal.",}),
}).or("nama_diskon", "persentase", "tanggal_awal", "tanggal_akhir");

// MIDDLEWARE CREATE
export const verifyCreateDiskon = (req: Request,res: Response,next: NextFunction) => {
  const { error } = createDiskonSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      status: false,
      message: error.details.map((d) => d.message).join(", "),
    });
  }

  next();
};

// MIDDLEWARE UPDATE
export const verifyUpdateDiskon = (req: Request,res: Response,next: NextFunction) => {
  const { error } = updateDiskonSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      status: false,
      message: error.details.map((d) => d.message).join(", "),
    });
  }

  next();
};
