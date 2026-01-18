import express from "express";
import { getDiskon, getDiskonByStan, detailDiskon, useDiskon, offDiskon, tambahDiskon, updateDiskon, hapusDiskon,} from "../controllers/diskonController"
import { verifyToken, verifyRole } from "../middlewares/authorization";
import { verifyCreateDiskon, verifyUpdateDiskon} from "../middlewares/diskonValidate"

const app = express();
app.use(express.json());

app.get(`/`,[verifyToken, verifyRole(["admin_stan"])], getDiskon);
app.get(`/detail/:id`,[verifyToken, verifyRole(["admin_stan"])], getDiskon);
app.get(`/stan/:id`,[verifyToken, verifyRole(["siswa","admin_stan"])], getDiskonByStan);
app.post(`/add`,[verifyToken, verifyRole(["admin_stan"]), verifyCreateDiskon], tambahDiskon);
app.put(`/edit/:id_diskon`, [verifyToken, verifyRole(["admin_stan"]), verifyUpdateDiskon], updateDiskon);
app.delete(`/delete/:id`,[verifyToken, verifyRole(["admin_stan"])], hapusDiskon )

app.post(`/use`,[verifyToken, verifyRole(["admin_stan"])], useDiskon);
app.post(`/off`,[verifyToken, verifyRole(["admin_stan"])], offDiskon);

export default app;
