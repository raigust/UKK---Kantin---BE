import { Request, Response } from "express";
import { PrismaClient, Role } from "@prisma/client";
import { sign } from "jsonwebtoken";
import md5 from "md5";
import fs from "fs";
import { BASE_URL, SECRET } from "../global";
const {v4: uuidv4} = require("uuid");

const prisma = new PrismaClient({ errorFormat: "pretty" });

export const getAllUser = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    const users = await prisma.users.findMany({
      where: {
        username: { contains: search?.toString() || "" }
      },
      include: {
        siswa: true,
        stan: true
      }
    });

    return res.status(200).json({
      status: true,
      data: users,
      message: "Users retrieved successfully"
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      message: `${error}`
    });
  }
};

export const getAllSiswa = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    const users = await prisma.users.findMany({
      where: {
        role: "siswa",
        username: { contains: search?.toString() || "" }
      },
      include: {
        siswa: true,
        stan: true
      }
    });

    return res.status(200).json({
      status: true,
      data: users,
      message: "All siswa retrieved successfully"
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      message: `${error}`
    });
  }
};
export const getAllAdminStan = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    const users = await prisma.users.findMany({
      where: {
        role: "admin_stan",
        username: { contains: search?.toString() || "" }
      },
      include: {
        siswa: true,
        stan: true
      }
    });

    return res.status(200).json({
      status: true,
      data: users,
      message: "All admin stan retrieved successfully"
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      message: `${error}`
    });
  }
};


// ============================
// GET PROFILE BY TOKEN
// ============================
export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).users;

    const profile = await prisma.users.findFirst({
      where: { id: user.id },
      include: {
        siswa: true,
        stan: true
      }
    });

    return res.status(200).json({
      status: true,
      data: profile
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      message: `${error}`
    });
  }
};

// =================================
// REGISTER USER (SISWA / ADMIN STAN)
// =================================
export const createUser = async (req: Request, res: Response) => {
  try {
    const {
      username,
      password,
      role,
      nama_siswa,
      alamat,
      telp,
      nama_stan,
      nama_pemilik,
    } = req.body;

    // Ambil foto dari multer
    const foto = req.file ? req.file.filename : "";

    // ===================================
    // CEK USERNAME SUDAH ADA
    // ===================================
    const existingUser = await prisma.users.findFirst({
      where: { username }
    });

    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: "Username sudah digunakan, gunakan username lain!"
      });
    }

    // ===================================
    // CREATE USER (DEFAULT ROLE = siswa)
    // ===================================
    const newUser = await prisma.users.create({
      data: {
        username,
        password: md5(password),
        role: (role as Role) || Role.siswa
      }
    });

    // ===================================
    // CREATE SISWA
    // ===================================
    if (!role || role === "siswa") {
      await prisma.siswa.create({
        data: {
          nama_siswa,
          alamat,
          telp,
          foto,
          id_user: newUser.id
        }
      });
    }

    // ===================================
    // CREATE ADMIN STAN
    // ===================================
    if (role === "admin_stan") {
      await prisma.stan.create({
        data: {
          nama_stan,
          nama_pemilik,
          telp,
          id_user: newUser.id
        }
      });
    }

    return res.status(200).json({
      status: true,
      message: "User berhasil dibuat",
      data: newUser
    });

  } catch (error) {
    return res.status(400).json({
      status: false,
      message: `${error}`
    });
  }
};

export const createUserAdmin = async (req: Request, res: Response) => {
  try {
    const {
      username,
      password,
      role,
      telp,
      nama_stan,
      nama_pemilik,
    } = req.body;

    // Ambil foto dari multer
    const foto = req.file ? req.file.filename : "";

    // ===================================
    // CEK USERNAME SUDAH ADA
    // ===================================
    const existingUser = await prisma.users.findFirst({
      where: { username }
    });

    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: "Username sudah digunakan, gunakan username lain!"
      });
    }

    // ===================================
    // CREATE USER (DEFAULT ROLE = siswa)
    // ===================================
    const newUser = await prisma.users.create({
      data: {
        username,
        password: md5(password),
        role: (role as Role) || Role.siswa
      }
    });

    if (role === "admin_stan") {
      await prisma.stan.create({
        data: {
          nama_stan,
          nama_pemilik,
          telp,
          id_user: newUser.id
        }
      });
    }

    return res.status(200).json({
      status: true,
      message: "User berhasil dibuat",
      data: newUser
    });

  } catch (error) {
    return res.status(400).json({
      status: false,
      message: `${error}`
    });
  }
};



// ============================
// UPDATE USER
// ============================
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const {
      username, password, role,
      nama_siswa, alamat, telp, foto,
      nama_stan, nama_pemilik, telp_stan
    } = req.body;

    const findUser = await prisma.users.findFirst({
      where: { id: Number(id) }
    });

    if (!findUser) {
      return res.status(404).json({
        status: false,
        message: "User not found"
      });
    }

    // ============================
    // UPDATE USERS
    // ============================
    await prisma.users.update({
      where: { id: Number(id) },
      data: {
        username: username || findUser.username,
        password: password ? md5(password) : findUser.password,
        role: role || findUser.role
      }
    });

    // ============================
    // UPDATE SISWA
    // ============================
    if ((role || findUser.role) === "siswa") {
      await prisma.siswa.updateMany({
        where: { id_user: Number(id) },
        data: {
          nama_siswa,
          alamat,
          telp,
          foto
        }
      });
    }

    // ============================
    // UPDATE ADMIN STAN
    // ============================
    if ((role || findUser.role) === "admin_stan") {
      await prisma.stan.updateMany({
        where: { id_user: Number(id) },
        data: {
          nama_stan,
          nama_pemilik,
          telp: telp_stan
        }
      });
    }

    return res.status(200).json({
      status: true,
      message: "User updated successfully"
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      message: `${error}`
    });
  }
};

// ============================
// DELETE USER
// ============================
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.siswa.deleteMany({ where: { id_user: Number(id) } });
    await prisma.stan.deleteMany({ where: { id_user: Number(id) } });

    await prisma.users.delete({
      where: { id: Number(id) }
    });

    return res.status(200).json({
      status: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      message: `${error}`
    });
  }
};

// ============================
// LOGIN
// ============================
export const authentication = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const findUser = await prisma.users.findFirst({
      where: {
        username,
        password: md5(password)
      }
    });

    if (!findUser) {
      return res.status(200).json({
        status: false,
        logged: false,
        message: "Username or password incorrect"
      });
    }

    const tokenPayload = {
      id: findUser.id,
      username: findUser.username,
      role: findUser.role
    };

    const token = sign(JSON.stringify(tokenPayload), SECRET || "token");

    return res.status(200).json({
      status: true,
      logged: true,
      message: "Login successful",
      token,
      data: tokenPayload
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      message: `${error}`
    });
  }
};
