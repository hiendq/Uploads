require('dotenv').config();


const Express = require('express')
const multer = require('multer')
const bodyParser = require('body-parser')
const path = require('path')
const Datauri = require('datauri/parser');

const storage = multer.memoryStorage();
const upload = multer({ storage }).array('photo');
const cloudinary = require("cloudinary").v2;
const meta = new Datauri();

const app = Express()
app.use(bodyParser.json())
const port = process.env.PORT || 5000;

const dataUri = file => {
  console.log("FILE NAME",file.originalname,path.extname(file.originalname))
  return meta.format(path.extname(file.originalname).toString(), file.buffer);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const getFiles = (req)=>{
  return req.files.map(file=>dataUri(file).content);
}

const uploadPhoto = async (file) => {
  const result = await cloudinary.uploader.upload(file);
  return result;
};

app.get('/', (req, res) => {
    return res.send('Done')
})

app.post('/api/upload', upload, async(req, res) => {
  let picture =[]
  const files = getFiles(req);
  for(let i in files){
    const uploadResult = await uploadPhoto(files[i]);
    picture.push(uploadResult.url);
  }

  res.status(201).json({
    message: 'success!',
    picture
  })
})

app.listen(port, () => {
  console.log(`App running on http://localhost:${port}`)
})
