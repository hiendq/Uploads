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
const port = process.env.PORT || 5000;

const Storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, './uploads')
  },
  filename(req, file, callback) {
    callback(null, `${file.fieldname}_${Date.now()}_${file.originalname}`)
  },
})

const upload = multer({ storage: Storage })

app.get('/', (req, res) => {

    // res.sendFile(path.join(`${__dirname}/uploads/photo_1592127650721_11.jpg`));
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