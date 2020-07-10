import { BinaryFile } from '../node_modules/binary-file-lib/files/BinaryFile.mjs';

export default class JPEG extends BinaryFile {

  static parseFile(file) {
    // read file header
    
  }

  static async decompress(data, { width = 0, height = 0 } = {}) {
    return new Promise((resolve, reject) => {
      const blob = new Blob([ data ]);

      const reader = new FileReader();
      reader.onloadend = function() {
          const img = new Image();
          
          img.src = reader.result;
          if(width) {
            img.width = width;
          }
          if(height) {
            img.height = height;
          }
          
          img.onload = () => {
            resolve(img);
          }
      }
      reader.readAsDataURL(blob); 
    })
  }

}
