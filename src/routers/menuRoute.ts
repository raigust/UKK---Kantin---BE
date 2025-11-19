import express from "express";
import { getAllMenus, tambahMenu, hapusMenu, updateMenu, detailMenu, getAllMenusForSiswa} from "../controllers/menuController"
import { verifyToken, verifyRole } from "../middlewares/authorization";
import { validateFilterMenu, validateTambahMenu, validateUpdateMenu} from "../middlewares/menuValidation"
import uploadFile from "../middlewares/menuUpload"

const app = express();
app.use(express.json());

app.get(`/`,[verifyToken, verifyRole(["admin_stan"]), validateFilterMenu],getAllMenus);
app.get(`/lihat`,[verifyToken, verifyRole(["siswa"]), validateFilterMenu], getAllMenusForSiswa);
app.post(`/`,[verifyToken, verifyRole(["admin_stan"]), uploadFile.single("foto"), validateTambahMenu],tambahMenu);
app.put(`/:id`,[verifyToken, verifyRole(["admin_stan"]), uploadFile.single("foto"), validateUpdateMenu],updateMenu);
app.delete(`/:id`,[verifyToken, verifyRole(["admin_stan"])],hapusMenu);
app.get(`/detail/:id`,[verifyToken],detailMenu);


export default app;
