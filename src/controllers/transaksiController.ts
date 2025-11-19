import { Request, Response } from "express";
import { JenisMenu, PrismaClient } from "@prisma/client";
import fs from "fs";
import { BASE_URL } from "../global";

const prisma = new PrismaClient({ errorFormat: "pretty" });

export const createOrder = async (req: Request, res: Response) => {
  try {
    const user = (req as any).users;

    if (user.role !== "siswa") {
      return res.status(403).json({ status: false, message: "Hanya siswa yang bisa membuat order." });
    }

    const { id_stan, pesan } = req.body;

    if (!id_stan || !pesan) {
      return res.status(400).json({
        status: false,
        message: "id_stan dan pesan wajib diisi.",
      });
    }

    // Jika datang dari form-data → pesan dalam string
    let items = pesan;
    if (typeof pesan === "string") {
      try {
        items = JSON.parse(pesan);
      } catch {
        return res.status(400).json({ status: false, message: "Format pesan tidak valid (bukan JSON)." });
      }
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: false,
        message: "List pesan tidak valid.",
      });
    }

    // 🔎 Ambil siswa yang login
    const siswa = await prisma.siswa.findFirst({
      where: { id_user: user.id },
    });

    if (!siswa) {
      return res.status(404).json({
        status: false,
        message: "Siswa tidak ditemukan.",
      });
    }

    // Ambil id menu dari list
    const menuIds = items.map((i: any) => Number(i.id_menu));

    const menus = await prisma.menu.findMany({
      where: {
        id: { in: menuIds },
        id_stan: Number(id_stan),
      },
    });

    // Validasi menu sesuai stan
    if (menus.length !== items.length) {
      return res.status(400).json({
        status: false,
        message: "Beberapa menu tidak valid atau tidak berasal dari stan tersebut.",
      });
    }

    // ✔ Buat transaksi baru
    const transaksiBaru = await prisma.transaksi.create({
      data: {
        tanggal: new Date(),
        id_stan: Number(id_stan),
        id_siswa: siswa.id,
      },
    });

    // ✔ Masukkan detail transaksi
    for (const item of items) {
      const menu = menus.find((m) => m.id === Number(item.id_menu));

      await prisma.detail_transaksi.create({
        data: {
          id_transaksi: transaksiBaru.id,
          id_menu: menu!.id,
          qty: Number(item.qty),
          harga_beli: menu!.harga,
        },
      });
    }

    return res.status(201).json({
      status: true,
      message: "Order berhasil dibuat.",
      data: transaksiBaru,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: `Terjadi kesalahan: ${error}`,
    });
  }
};


export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const user = (req as any).users;
    const { id } = req.params;

    // Cek siswa yang login
    const siswa = await prisma.siswa.findFirst({
      where: { id_user: user.id },
    });

    if (!siswa) {
      return res.status(403).json({
        status: false,
        message: "Akun siswa tidak ditemukan.",
      });
    }

    // Cek transaksi milik siswa
    const transaksi = await prisma.transaksi.findFirst({
      where: { id: Number(id), id_siswa: siswa.id },
    });

    if (!transaksi) {
      return res.status(404).json({
        status: false,
        message: "Transaksi tidak ditemukan.",
      });
    }

    // ❗ Batasi hanya status 'belum_dikonfirm' yang boleh delete
    if (transaksi.status !== "belum_dikonfirm") {
      return res.status(403).json({
        status: false,
        message:
          "Transaksi tidak bisa dihapus. Pesanan sudah diproses oleh stan.",
      });
    }

    // Delete detail transaksi terlebih dahulu
    await prisma.detail_transaksi.deleteMany({
      where: { id_transaksi: transaksi.id },
    });

    // Delete transaksi utama
    await prisma.transaksi.delete({
      where: { id: transaksi.id },
    });

    return res.status(200).json({
      status: true,
      message: "Transaksi berhasil dihapus.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: `Error: ${error}`,
    });
  }
};


export const getSiswaHistory = async (req: Request, res: Response) => {
  try {
    const user = (req as any).users;

    if (user.role !== "siswa") {
      return res.status(403).json({ status: false, message: "Anda bukan siswa." });
    }

    const siswa = await prisma.siswa.findFirst({
      where: { id_user: user.id },
    });

    const history = await prisma.transaksi.findMany({
      where: { id_siswa: siswa!.id },
      include: {
        stan: true,
        detail: {
          include: { menu: true },
        },
      },
      orderBy: { tanggal: "desc" },
    });

    return res.status(200).json({
      status: true,
      message: "Riwayat transaksi siswa.",
      data: history,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: `Error: ${error}` });
  }
};

export const getStanHistory = async (req: Request, res: Response) => {
  try {
    const user = (req as any).users;

    if (user.role !== "admin_stan") {
      return res.status(403).json({ status: false, message: "Anda bukan admin stan." });
    }

    const stan = await prisma.stan.findFirst({
      where: { id_user: user.id },
    });

    const history = await prisma.transaksi.findMany({
      where: { id_stan: stan!.id },
      include: {
        siswa: true,
        detail: {
          include: { menu: true },
        },
      },
      orderBy: { tanggal: "desc" },
    });

    return res.status(200).json({
      status: true,
      message: "Riwayat transaksi stan.",
      data: history,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: `Error: ${error}` });
  }
};

export const updateStatusTransaksi = async (req: Request, res: Response) => {
  try {
    const user = (req as any).users;
    const { id } = req.params;
    const { status } = req.body;

    if (user.role !== "admin_stan") {
      return res.status(403).json({ status: false, message: "Anda bukan admin stan." });
    }

    const stan = await prisma.stan.findFirst({
      where: { id_user: user.id },
    });

    const transaksi = await prisma.transaksi.findFirst({
      where: { id: Number(id), id_stan: stan!.id },
    });

    if (!transaksi) {
      return res.status(404).json({ status: false, message: "Transaksi tidak ditemukan." });
    }

    // Validasi status
    const validStatus = ["belum_dikonfirm", "dimasak", "diantar", "sampai"];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ status: false, message: "Status tidak valid." });
    }

    const updated = await prisma.transaksi.update({
      where: { id: transaksi.id },
      data: { status },
    });

    return res.status(200).json({
      status: true,
      message: "Status transaksi berhasil diperbarui.",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: `Error: ${error}` });
  }
};

export const getPemasukanByBulan = async (req: Request, res: Response) => {
  try {
    const user = (req as any).users;

    // hanya admin stan
    if (user.role !== "admin_stan") {
      return res.status(403).json({
        status: false,
        message: "Akses hanya untuk admin stan.",
      });
    }

    const { bulan, tahun } = req.query;

    if (!bulan || !tahun) {
      return res.status(400).json({
        status: false,
        message: "Parameter bulan dan tahun wajib diisi.",
      });
    }

    // cari stan berdasarkan user token
    const stan = await prisma.stan.findFirst({
      where: { id_user: user.id },
    });

    if (!stan) {
      return res.status(404).json({
        status: false,
        message: "Stan tidak ditemukan.",
      });
    }

    // ambil semua detail transaksi bulan itu
    const detail = await prisma.detail_transaksi.findMany({
      where: {
        transaksi: {
          id_stan: stan.id,
          status: "sampai",
          tanggal: {
            gte: new Date(`${tahun}-${bulan}-01`),
            lt: new Date(`${tahun}-${Number(bulan) + 1}-01`),
          },
        },
      },
      select: {
        qty: true,
        harga_beli: true,
      }
    });

    // hitung total pemasukan = Σ(qty * harga_beli)
    let totalPemasukan = 0;
    detail.forEach(item => {
      totalPemasukan += item.qty * item.harga_beli;
    });

    return res.status(200).json({
      status: true,
      message: "Pemasukan bulan ini berhasil dihitung.",
      bulan,
      tahun,
      total_pemasukan: totalPemasukan,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: `Error: ${error}`,
    });
  }
};


export const getOrderByMonth = async (req: Request, res: Response) => {
  try {
    const user = (req as any).users;

    if (user.role !== "admin_stan") {
      return res.status(403).json({
        status: false,
        message: "Akses ditolak. Hanya admin stan.",
      });
    }

    const { bulan, tahun } = req.query;

    if (!bulan || !tahun) {
      return res.status(400).json({
        status: false,
        message: "Parameter bulan dan tahun wajib diisi.",
      });
    }

    const stan = await prisma.stan.findFirst({
      where: { id_user: user.id },
    });

    if (!stan) {
      return res.status(404).json({
        status: false,
        message: "Stan tidak ditemukan.",
      });
    }

    const orders = await prisma.transaksi.findMany({
      where: {
        id_stan: stan.id,
        tanggal: {
          gte: new Date(`${tahun}-${bulan}-01`),
          lt: new Date(`${tahun}-${Number(bulan) + 1}-01`),
        },
      },
      include: {
        siswa: {
          select: {
            id: true,
            nama_siswa: true,
          },
        },
        detail: {
          include: {
            menu: {
              select: {
                nama_makanan: true,
                harga: true,
                jenis: true,
              },
            },
          },
        },
      },
      orderBy: { tanggal: "desc" },
    });

    return res.status(200).json({
      status: true,
      message: "Daftar order berhasil ditampilkan.",
      bulan,
      tahun,
      data: orders,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: `Error: ${error}`,
    });
  }
};


