import { Request, Response } from "express";
import { JenisMenu, PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import fs from "fs";
import { BASE_URL } from "../global";

const prisma = new PrismaClient({ errorFormat: "pretty" });

export const detailDiskon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const data = await prisma.diskon.findFirst({
      where: { id: Number(id) },
      include: {
        stan: true,
        menu_diskon: {
          include: {
            menu: true,
          },
        },
      },
    });

    if (!data) {
      return res.status(404).json({ status: false, message: "Diskon tidak ditemukan" });
    }

    return res.status(200).json({
      status: true,
      message: "Detail diskon ditemukan",
      data,
    });
  } catch (err) {
    return res.status(400).json({ status: false, message: `${err}` });
  }
};


export const tambahDiskon = async (req: Request, res: Response) => {
  try {
    const { nama_diskon, persentase_diskon, tanggal_awal, tanggal_akhir } = req.body;
    const user = (req as any).users;

    // Validasi admin stan
    if (user.role !== "admin_stan") {
      return res.status(403).json({
        status: false,
        message: "Anda bukan admin stan",
      });
    }

    // Ambil stan milik user
    const stan = await prisma.stan.findFirst({
      where: { id_user: user.id },
    });

    if (!stan) {
      return res.status(404).json({
        status: false,
        message: "Stan tidak ditemukan",
      });
    }

    // Buat diskon saja (tanpa relasi ke menu)
    const newDiskon = await prisma.diskon.create({
      data: {
        nama_diskon,
        persentase_diskon: Number(persentase_diskon),
        tanggal_awal: new Date(tanggal_awal),
        tanggal_akhir: new Date(tanggal_akhir),
        // optional: simpan id_stan agar diskon ini milik stan tertentu
        id_stan: stan.id,
      },
    });

    return res.status(200).json({
      status: true,
      message: "Diskon berhasil dibuat",
      data: newDiskon,
    });

  } catch (err) {
    return res.status(400).json({
      status: false,
      message: `${err}`,
    });
  }
};


export const updateDiskon = async (req: Request, res: Response) => {
  try {
    const { id_diskon } = req.params; // ⬅ ID sekarang dari params
    const { nama_diskon, persentase_diskon, tanggal_awal, tanggal_akhir } = req.body;
    const user = (req as any).users;

    if (user.role !== "admin_stan") {
      return res.status(403).json({ status: false, message: "Anda bukan admin stan" });
    }

    // Pastikan id_diskon valid
    if (!id_diskon || isNaN(Number(id_diskon))) {
      return res.status(400).json({
        status: false,
        message: "ID diskon tidak valid",
      });
    }

    // Cek apakah diskon ada
    const diskon = await prisma.diskon.findFirst({
      where: { id: Number(id_diskon) },
    });

    if (!diskon) {
      return res.status(404).json({ status: false, message: "Diskon tidak ditemukan" });
    }

    // Update data
    const updated = await prisma.diskon.update({
      where: { id: Number(id_diskon) },
      data: {
        nama_diskon: nama_diskon ?? diskon.nama_diskon,
        persentase_diskon: persentase_diskon ? Number(persentase_diskon) : diskon.persentase_diskon,
        tanggal_awal: tanggal_awal ? new Date(tanggal_awal) : diskon.tanggal_awal,
        tanggal_akhir: tanggal_akhir ? new Date(tanggal_akhir) : diskon.tanggal_akhir,
      },
    });

    return res.status(200).json({
      status: true,
      message: "Diskon berhasil diperbarui",
      data: updated,
    });
  } catch (err) {
    return res.status(400).json({
      status: false,
      message: `Terjadi sebuah kesalahan: ${err}`,
    });
  }
};


export const getDiskon = async (req: Request, res: Response) => {
  try {
    const user = (req as any).users;

    if (user.role !== "admin_stan") {
      return res.status(403).json({ status: false, message: "Anda bukan admin stan" });
    }

    // Cek stan pemilik
    const stan = await prisma.stan.findFirst({
      where: { id_user: user.id },
    });

    if (!stan) {
      return res.status(404).json({ status: false, message: "Stan tidak ditemukan" });
    }

    // Ambil semua diskon milik stan
    const data = await prisma.diskon.findMany({
      where: {
        id_stan: stan.id,
      },
      include: {
        menu_diskon: {
          include: {
            menu: true,
          },
        },
      },
    });

    return res.status(200).json({
      status: true,
      message: "Data diskon berhasil diambil",
      data,
    });
  } catch (err) {
    return res.status(400).json({ status: false, message: `${err}` });
  }
};

export const getDiskonByStan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const now = dayjs();

    const stan = await prisma.stan.findFirst({
      where: { id: Number(id) },
    });

    if (!stan) {
      res.status(200).json({
        status: false,
        message: "Stan tidak ditemukan",
      });
      return;
    }

    const activeDiskon = await prisma.diskon.findMany({
      where: {
        id_stan: Number(id),
        tanggal_awal: { lte: now.toDate() },
        tanggal_akhir: { gte: now.toDate() },
      },
      include: {
        menu_diskon: {
          include: { menu: true },
        },
      },
      orderBy: { tanggal_awal: "desc" },
    });

    res.status(200).json({
      status: "success",
      message: `Diskon dari kantin ${stan.nama_stan} berhasil ditampilkan.`,
      data: activeDiskon,
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: error,
      message: `Terjadi sebuah kesalahan : ${error}.`,
    });
    return;
  }
};

export const deleteDiskon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // id diskon
    const user = (req as any).users;

    // Hanya admin stan
    if (user.role !== "admin_stan") {
      return res.status(403).json({
        status: false,
        message: "Anda bukan admin stan",
      });
    }

    // Cek stan pemilik berdasarkan user login
    const stan = await prisma.stan.findFirst({
      where: { id_user: user.id },
    });

    if (!stan) {
      return res.status(404).json({
        status: false,
        message: "Stan tidak ditemukan",
      });
    }

    // Cek apakah diskon benar-benar milik stan ini
    const diskon = await prisma.diskon.findFirst({
      where: {
        id: Number(id),
        menu_diskon: {
          some: {
            menu: {
              id_stan: stan.id,
            },
          },
        },
      },
      include: {
        menu_diskon: true,
      }
    });

    if (!diskon) {
      return res.status(404).json({
        status: false,
        message: "Diskon tidak ditemukan atau bukan milik stan ini",
      });
    }

    // Hapus relasi dari menu_diskon
    await prisma.menu_diskon.deleteMany({
      where: {
        id_diskon: Number(id),
      },
    });

    // Hapus diskon
    await prisma.diskon.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({
      status: true,
      message: "Diskon berhasil dihapus",
    });

  } catch (error) {
    return res.status(400).json({
      status: false,
      message: `Terjadi suatu kesalahan: ${error}`,
    });
  }
};

export const useDiskon = async (req: Request, res: Response) => {
  try {
    let { id_diskon, id_menu } = req.body;
    const user = (req as any).users;

    // ------------------------------------
    // 🔥 NORMALISASI id_menu dari form-data
    // ------------------------------------
    let menuIds: number[] = [];

    if (!id_menu) {
      return res.status(400).json({
        status: false,
        message: "id_menu wajib diisi.",
      });
    }

    if (Array.isArray(id_menu)) {
      // form-data kirim banyak field: id_menu: 1, id_menu:2...
      menuIds = id_menu.map((v: any) => Number(v));
    } else if (typeof id_menu === "string") {
      // form-data kirim satu field: id_menu: "1,2,3"
      try {
        if (id_menu.includes(",")) {
          menuIds = id_menu.split(",").map((v) => Number(v.trim()));
        } else {
          // Bisa jadi "1"
          menuIds = [Number(id_menu)];
        }
      } catch {
        return res.status(400).json({
          status: false,
          message: "Format id_menu tidak valid.",
        });
      }
    } else {
      // single number
      menuIds = [Number(id_menu)];
    }

    // Validasi id menu
    if (menuIds.length === 0 || menuIds.some(isNaN)) {
      return res.status(400).json({
        status: false,
        message: "Format id_menu tidak valid.",
      });
    }

    // ------------------------------------
    // ✔ Ambil stan
    // ------------------------------------
    const stan = await prisma.stan.findFirst({
      where: { id_user: user.id },
    });

    if (!stan) {
      return res.status(200).json({
        status: false,
        message: "Stan tidak ditemukan.",
      });
    }

    // ------------------------------------
    // ✔ Cek diskon
    // ------------------------------------
    const findDiskon = await prisma.diskon.findFirst({
      where: {
        id: Number(id_diskon),
        id_stan: stan.id,
      },
    });

    if (!findDiskon) {
      return res.status(200).json({
        status: false,
        message: "Diskon tidak ditemukan atau bukan milik anda.",
      });
    }

    // ------------------------------------
    // ✔ Ambil menu milik stan
    // ------------------------------------
    const menus = await prisma.menu.findMany({
      where: {
        id: { in: menuIds },
        id_stan: stan.id,
      },
    });

    if (menus.length !== menuIds.length) {
      return res.status(200).json({
        status: false,
        message: "Beberapa menu tidak ditemukan atau bukan milik stan Anda.",
      });
    }

    // ------------------------------------
    // ✔ Cek menu yang sudah memakai diskon
    // ------------------------------------
    const existingAssignments = await prisma.menu_diskon.findMany({
      where: {
        id_diskon: Number(id_diskon),
        id_menu: { in: menuIds },
      },
    });

    const existingMenuIds = existingAssignments.map((m) => m.id_menu);

    const menusToAssign = menus.filter((m) => !existingMenuIds.includes(m.id));

    if (menusToAssign.length === 0) {
      return res.status(200).json({
        status: false,
        message: "Semua menu sudah memiliki diskon ini.",
      });
    }

    // ------------------------------------
    // ✔ Tambahkan ke relasi menu_diskon
    // ------------------------------------
    const newAssignments = await prisma.menu_diskon.createMany({
      data: menusToAssign.map((m) => ({
        id_diskon: Number(id_diskon),
        id_menu: m.id,
      })),
      skipDuplicates: true,
    });

    // ------------------------------------
    // ✔ Update harga menu setelah diskon
    // ------------------------------------
    for (const menu of menusToAssign) {
      const newHarga =
        Number(menu.harga) * (1 - findDiskon.persentase_diskon / 100);

      await prisma.menu.update({
        where: { id: menu.id },
        data: { harga: newHarga },
      });
    }

    return res.status(200).json({
      status: true,
      message: `Diskon berhasil diterapkan ke ${menusToAssign.length} menu.`,
      data: newAssignments,
    });

  } catch (error) {
    console.log(error);
    return res.status(400).json({
      status: false,
      message: `Terjadi sebuah kesalahan : ${error}`,
    });
  }
};



export const offDiskon = async (req: Request, res: Response) => {
  try {
    const { id_diskon, id_menu } = req.body;
    const user = (req as any).users;

    // Ubah ke array meskipun input-nya angka
    const menuIds = Array.isArray(id_menu) ? id_menu : [id_menu];

    if (menuIds.length === 0) {
      return res.status(200).json({
        status: false,
        message: "Harus ada setidaknya satu menu untuk dilepas diskonnya.",
      });
    }

    const stan = await prisma.stan.findFirst({
      where: { id_user: user.id },
    });

    if (!stan) {
      return res.status(200).json({
        status: false,
        message: "Stan tidak ditemukan.",
      });
    }

    const findDiskon = await prisma.diskon.findFirst({
      where: {
        id: Number(id_diskon),
        id_stan: stan.id,
      },
    });

    if (!findDiskon) {
      return res.status(200).json({
        status: false,
        message: "Diskon tidak ditemukan atau bukan milik anda.",
      });
    }

    // Hapus relasi menu-diskon
    const deleteMenuDiskon = await prisma.menu_diskon.deleteMany({
      where: {
        id_diskon: Number(id_diskon),
        id_menu: { in: menuIds.map(Number) },
      },
    });

    // Ambil menu untuk kembalikan harga
    const menusToUpdate = await prisma.menu.findMany({
      where: {
        id: { in: menuIds.map(Number) },
      },
    });

    for (const menu of menusToUpdate) {
      const originalHarga =
        Number(menu.harga) / (1 - findDiskon.persentase_diskon / 100);

      await prisma.menu.update({
        where: { id: menu.id },
        data: { harga: originalHarga },
      });
    }

    return res.status(200).json({
      status: "success",
      message: `Diskon berhasil dilepas dari ${deleteMenuDiskon.count} menu.`,
      data: deleteMenuDiskon,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      status: false,
      message: `Terjadi sebuah kesalahan : ${error}`,
    });
  }
};

