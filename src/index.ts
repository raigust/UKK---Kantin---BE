import express from 'express'
import cors from 'cors'
import path from 'path'
import userRoute from './routers/userRoute'
import menuRoute from './routers/menuRoute'
import diskonRoute from './routers/diskonRoute'
import transaksiRoute from './routers/transaksiRoute'

const PORT: number = 8000
const app = express()
app.use(cors())

app.use(`/user`, userRoute)
app.use(`/menu`, menuRoute)
app.use(`/diskon`, diskonRoute)
app.use(`/order`, transaksiRoute)

app.use(express.static(path.join(__dirname, '..', 'public')));

app.listen(PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`)
})