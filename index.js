import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { connectToMongo } from './utility/db.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(helmet())

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://aliscakesandbakes.in",
    "https://www.aliscakesandbakes.in",
    "https://api.aliscakesandbakes.in"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests, please try again later.',
})

app.use(limiter)
app.use(express.json())

connectToMongo()

app.use('/uploads', express.static('uploads'))

const routesPath = path.join(__dirname, 'routes')
fs.readdirSync(routesPath).forEach(async (file) => {
  if (file.endsWith('.routes.js')) {
    const routeModule = await import(`./routes/${file}`)
    app.use('/api', routeModule.default)
    // console.log(`✔️  Loaded route: ${file}`)
  }
})

app.get('/', async (req, res) => {
  res.send('Hello World!')
})

const PORT = process.env.PORT || 5000

app.use('/my-admin', express.static(path.join(__dirname, 'build')));

app.get(/^\/my-admin(\/.*)?$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})


