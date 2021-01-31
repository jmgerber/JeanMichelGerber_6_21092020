const multer = require('multer');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_').split('.')[0];
    const extension = MIME_TYPES[file.mimetype];
    if(extension != undefined){
      callback(null, name + Date.now() + '.' + extension);
    } else {
      callback('Format non autorisé');
    }
  }
});

module.exports = multer({storage: storage}).single('image');