require("dotenv").config();
const express = require("express");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
const Multer = require("multer");
const { Pool } = require("pg");

// Configure Cloudinary
// cloudinary.config({
//   cloud_name: 'dhyiohcxw',
//   api_key: '194635957535994',
//   api_secret: '7HruVDyS2OiKJ0KfxBbZy9qvbd4'
// });

cloudinary.config({ 
  cloud_name: 'denjool8v', 
  api_key: '195581119735494', 
  api_secret: 'wqWj4pSuY9jOo2gKi9fDa7u1_9w' 
});

// Configure PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'shahid',
  password: 'shahid123',
  port: 5432,
});

const storage = new Multer.memoryStorage();
const upload = Multer({
  storage,
});

async function handleUpload(file) {
  const res = await cloudinary.uploader.upload(file, {
    resource_type: "auto",
  });
  return res;
}

const app = express();

app.use(cors());

app.get('/', function (req, res) {
  res.send('Hi');
});

app.post("/upload", upload.single("my_file"), async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    const cldRes = await handleUpload(dataURI);

    // Insert data into PostgreSQL
    const insertQuery = `
      INSERT INTO uploaded_files (public_id, secure_url)
      VALUES ($1, $2)
      RETURNING *
    `;
    const values = [cldRes.public_id, cldRes.secure_url];
    const dbRes = await pool.query(insertQuery, values);

    res.json(dbRes.rows[0]);
  } catch (error) {
    console.log(error);
    res.send({
      message: error.message,
    });
  }
});

app.get("/getImages", async (req, res) => {
  try {
    const getImagesQuery = `
      SELECT secure_url
      FROM uploaded_files
    `;

    const dbRes = await pool.query(getImagesQuery);
    const imageUrls = dbRes.rows.map((row) => row.secure_url);

    res.json(imageUrls);
  } catch (error) {
    console.log(error);
    res.send({
      message: error.message,
    });
  }
});

const port = 3001;
app.listen(port, () => {
  console.log(`Server Listening on ${port}`);
});
