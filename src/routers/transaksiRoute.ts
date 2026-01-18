import express from "express";
import { createOrder, deleteOrder, getSiswaHistory, getSiswaOrderanSelesai, getStanHistory, updateStatusTransaksi, getPemasukanByBulan, getOrderByMonth, cetakNotaTransaksi } from "../controllers/transaksiController"
import { verifyToken, verifyRole } from "../middlewares/authorization";
import { verifyCreateOrder, verifyUpdateStatus} from "../middlewares/orderValidation"

const app = express();
app.use(express.json());

app.post(`/create`,[verifyToken, verifyRole(["siswa"]), verifyCreateOrder], createOrder);
app.delete(`/hapusorder/:id`,[verifyToken, verifyRole(["siswa"])], deleteOrder);
app.get(`/history/siswa`,[verifyToken, verifyRole(["siswa"])], getSiswaHistory)
app.get(`/recent/siswa`,[verifyToken, verifyRole(["siswa"])], getSiswaOrderanSelesai)
app.get(`/history/stan`,[verifyToken, verifyRole(["admin_stan"])], getStanHistory)
app.put(`/update/:id`,[verifyToken, verifyRole(["admin_stan"]), verifyUpdateStatus], updateStatusTransaksi)

app.get(`/report/pemasukan`,[verifyToken, verifyRole(["admin_stan"])], getPemasukanByBulan)
app.get(`/report/orders`,[verifyToken, verifyRole(["admin_stan"])], getOrderByMonth)

app.get(`/cetaknota/:id`,[verifyToken, verifyRole(["siswa"])], cetakNotaTransaksi)

export default app;
