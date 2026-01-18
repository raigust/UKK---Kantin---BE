import express from "express";
import { createUser, getAllUser, getAllAdminStan, getAllSiswa ,updateUser, deleteUser, authentication, getProfile, createUserAdmin, } from "../controllers/userController";
import { verifyToken, verifyRole } from "../middlewares/authorization";
import { verifyEditUser, verifyRegisterAdminStan, verifyRegisterSiswa, verifyEditUserSiswa} from "../middlewares/verifyUser";
import { verifyAuthentication } from "../middlewares/userValidation";
import uploadFile from "../middlewares/userUpload"

const app = express();
app.use(express.json());

app.get(`/profile`, [verifyToken], getProfile);

app.get(`/getadmin`, [verifyToken, verifyRole(["admin_stan"])], getAllAdminStan);
app.post(`/stan`, uploadFile.single("foto"), [verifyRegisterAdminStan], createUserAdmin);
app.put(`/stan/:id`, [verifyToken, verifyRole(["admin_stan"]), uploadFile.single("foto"), verifyEditUser], updateUser);
app.delete(`/:id`, [verifyToken, verifyRole(["admin_stan"])], deleteUser);
app.post(`/addsiswa`, [verifyToken, verifyRole(["admin_stan"]), uploadFile.single("foto"), verifyRegisterSiswa], createUser);
app.put(`/editsiswa/:id`, [verifyToken, verifyRole(["admin_stan"]), uploadFile.single("foto"), verifyEditUserSiswa], updateUser);

app.get(`/getsiswa`, [verifyToken, verifyRole(["admin_stan"])], getAllSiswa);
app.get(`/getstan`, [verifyToken, verifyRole(["siswa"])], getAllAdminStan);
app.post(`/siswa`, uploadFile.single("foto"), [verifyRegisterSiswa], createUser);
app.put(`/siswa/:id`, [verifyToken, verifyRole(["siswa"]), uploadFile.single("foto"), verifyEditUserSiswa], updateUser);

app.post(`/login`, [verifyAuthentication], authentication);

export default app;
