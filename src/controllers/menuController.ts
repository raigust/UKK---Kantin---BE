import { Request, Response } from "express";
import { JenisMenu, PrismaClient } from "@prisma/client";
import fs from "fs";
import dotenv from "dotenv"
dotenv.config()
import { BASE_URL } from "../global";

const prisma = new PrismaClient({ errorFormat: "pretty" });

// ==========================
// SHOW MENU (KHUSUS STAN)
// ==========================
export const getAllMenus = async (req: Request, res: Response) => {
  try {
    const { search, jenis, harga_min, harga_max } = req.query;
    const user = (req as any).users;

    // Ambil stan berdasarkan user token
    const stan = await prisma.stan.findFirst({
      where: { id_user: user.id },
    });

    if (!stan) {
      return res.status(404).json({
        status: false,
        message: "Stan tidak ditemukan untuk user ini",
      });
    }

    const allMenus = await prisma.menu.findMany({
      where: {
        id_stan: stan.id,

        nama_makanan: search
          ? {
              contains: search.toString(),
            }
          : undefined,
 
        jenis: jenis
          ? {
              equals: jenis.toString() as JenisMenu
            }
          : undefined,

        harga:
          harga_min || harga_max
            ? {
                gte: harga_min ? Number(harga_min) : undefined,
                lte: harga_max ? Number(harga_max) : undefined,
              }
            : undefined,
      },

      include: {
        stan: {
          select: {
            id: true,
            nama_stan: true,
          },
        },
      },

      orderBy: { nama_makanan: "asc" },
    });

    return res.status(200).json({
      status: true,
      message: "Menu berhasil ditampilkan",
      data: allMenus,
    });
  } catch (err) {
    return res.status(400).json({
      status: false,
      message: `Error: ${err}`,
    });
  }
};

// ==========================
// TAMBAH MENU
// ==========================
export const tambahMenu = async (req: Request, res: Response) => {
  try {
    const { nama_makanan, harga, jenis, deskripsi } = req.body;
    const user = (req as any).users;

    if (!user) {
      return res.status(400).json({
        status: false,
        message: "User tidak ditemukan di token",
      });
    }

    const stan = await prisma.stan.findFirst({
      where: { id_user: user.id },
    });

    if (!stan) {
      return res.status(404).json({
        status: false,
        message: "Stan tidak ditemukan",
      });
    }

    let filename = req.file ? req.file.filename : "";

    // 🔥 NORMALISASI ENUM
    // Ambil semua enum dari Prisma (contoh: ["MAKANAN","MINUMAN","SNACK"])
    const enumValues = Object.values(JenisMenu);

    // Samakan input user jadi uppercase
    const jenisUpper = jenis.toString().toUpperCase();

    // CARI YANG MATCH enum Prisma
    const matchedEnum = enumValues.find(
      (v) => v.toUpperCase() === jenisUpper
    );

    if (!matchedEnum) {
      return res.status(400).json({
        status: false,
        message: `Jenis menu tidak valid. Gunakan salah satu: ${enumValues.join(
          ", "
        )}`,
      });
    }

    const newMenu = await prisma.menu.create({
      data: {
        nama_makanan,
        harga: Number(harga),
        jenis: matchedEnum as JenisMenu,
        deskripsi,
        foto: filename,
        id_stan: stan.id,
      },
    });

    return res.status(200).json({
      status: true,
      message: "Menu baru berhasil dibuat",
      data: newMenu,
    });
  } catch (err) {
    return res.status(400).json({
      status: false,
      message: `${err}`,
    });
  }
};



// ==========================
// UPDATE MENU
// ==========================
export const updateMenu = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nama_makanan, harga, jenis, deskripsi } = req.body;
    const user = (req as any).users;

    if (!user) {
      return res.status(400).json({
        status: false,
        message: "User tidak ditemukan di token",
      });
    }

    const stan = await prisma.stan.findFirst({
      where: { id_user: user.id },
    });

    const menu = await prisma.menu.findFirst({
      where: { id: Number(id), id_stan: stan?.id },
    });

    if (!menu) {
      return res.status(404).json({
        status: false,
        message: "Menu tidak ditemukan atau bukan milik stan ini",
      });
    }

    let filename = menu.foto;

    // Jika update foto
    if (req.file) {
      filename = req.file.filename;

      if (menu.foto) {
        const oldPath = `./public/menu/${menu.foto}`;
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    const updatedMenu = await prisma.menu.update({
      where: { id: Number(id) },
      data: {
        nama_makanan: nama_makanan || menu.nama_makanan,
        harga: harga ? Number(harga) : menu.harga,
        jenis: jenis ? jenis : menu.jenis,
        deskripsi: deskripsi || menu.deskripsi,
        foto: filename,
      },
    });

    return res.status(200).json({
      status: true,
      message: "Menu berhasil diperbarui",
      data: updatedMenu,
    });
  } catch (err) {
    return res.status(400).json({ status: false, message: `${err}` });
  }
};

// ==========================
// HAPUS MENU
// ==========================
export const hapusMenu = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).users;

    const stan = await prisma.stan.findFirst({
      where: { id_user: user.id },
    });

    const menu = await prisma.menu.findFirst({
      where: { id: Number(id), id_stan: stan?.id },
    });

    if (!menu) {
      return res.status(404).json({
        status: false,
        message: "Menu tidak ditemukan atau bukan milik stan ini",
      });
    }

    // Hapus foto jika ada
    if (menu.foto) {
      const path = `./public/menu/${menu.foto}`;
      if (fs.existsSync(path)) fs.unlinkSync(path);
    }

    await prisma.menu.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({
      status: true,
      message: "Menu berhasil dihapus",
    });
  } catch (err) {
    return res.status(400).json({ status: false, message: `${err}` });
  }
};

// ==========================
// DETAIL MENU
// ==========================
export const detailMenu = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const findMenu = await prisma.menu.findUnique({
      where: { id: Number(id) },
    });

    if (!findMenu) {
      return res.status(404).json({
        status: false,
        message: "Menu tidak ditemukan",
      });
    }

    return res.status(200).json({
      status: true,
      data: findMenu,
    });
  } catch (err) {
    return res.status(400).json({ status: false, message: `${err}` });
  }
};
export const getAllMenusForSiswa = async (req: Request, res: Response) => {
  try {
    const { search, jenis, harga_min, harga_max, id_stan } = req.query;

    let nama_stan = "Semua kantin";

    if (id_stan) {
      const stan = await prisma.stan.findFirst({
        where: { id: Number(id_stan) },
        select: { nama_stan: true },
      });

      if (!stan) {
        return res.status(200).json({
          status: false,
          message: `Kantin dengan ID ${id_stan} tidak ditemukan.`,
        });
      }

      nama_stan = stan.nama_stan;
    }

    const findMenu = await prisma.menu.findMany({
      where: {
        id_stan: id_stan ? Number(id_stan) : undefined,

        // FIX: Tanpa mode
        nama_makanan: search
          ? {
              contains: search.toString(),
            }
          : undefined,

       jenis: jenis
          ? {
              equals: jenis.toString() as JenisMenu
            }
          : undefined,

        harga:
          harga_min || harga_max
            ? {
                gte: harga_min ? Number(harga_min) : undefined,
                lte: harga_max ? Number(harga_max) : undefined,
              }
            : undefined,
      },

      include: {
        stan: {
          select: {
            id: true,
            nama_stan: true,
          },
        },
      },

      orderBy: { nama_makanan: "asc" },
    });

    res.status(200).json({
      status: "success",
      message: `Menu kantin berhasil ditampilkan.`,
      data: findMenu,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      status: "error",
      message: `Terjadi sebuah kesalahan: ${error}`,
    });
  }
};

export const getMenuByStan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { search, jenis, harga_min, harga_max } = req.query;
    const user = (req as any).users;

    // Ambil stan berdasarkan user token
    const stan = await prisma.stan.findFirst({
      where: { id: Number(id) },
    });

    if (!stan) {
      return res.status(404).json({
        status: false,
        message: "Stan tidak ditemukan untuk user ini",
      });
    }

    const allMenus = await prisma.menu.findMany({
      where: {
        id_stan: stan.id,

        nama_makanan: search
          ? {
              contains: search.toString(),
            }
          : undefined,
 
        jenis: jenis
          ? {
              equals: jenis.toString() as JenisMenu
            }
          : undefined,

        harga:
          harga_min || harga_max
            ? {
                gte: harga_min ? Number(harga_min) : undefined,
                lte: harga_max ? Number(harga_max) : undefined,
              }
            : undefined,
      },

      include: {
        stan: {
          select: {
            id: true,
            nama_stan: true,
          },
        },
      },

      orderBy: { nama_makanan: "asc" },
    });

    return res.status(200).json({
      status: true,
      message: "Menu berhasil ditampilkan",
      data: allMenus,
    });
  } catch (err) {
    return res.status(400).json({
      status: false,
      message: `Error: ${err}`,
    });
  }
};



