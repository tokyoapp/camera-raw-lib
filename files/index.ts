import TIFFFile from './TIFF.ts';
import DNGFile from './DNG.mjs';
import CR2File from './CR2.mjs';
import CR3File from './CR3.mjs';
import ARWFile from './ARW.mjs';
import NEFFile from './NEF.ts';
import PNGFile from './PNG.ts';
import JPEGFile from './JPEG.ts';

export async function parseImageFile(filename, data) {
  const parts = filename.split(".");
  const ending = parts[parts.length-1];

  let FileType;

  switch(ending.toLocaleUpperCase()) {
    case "CR2":
      FileType = CR2File;
      break;
    case "CR3":
      FileType = CR3File;
      break;
    case "ARW":
      FileType = ARWFile;
      break;
    case "DNG":
      FileType = DNGFile;
      break;
    case "NEF":
      FileType = NEFFile;
      break;
    case "PNG":
      FileType = PNGFile;
      break;
    case "JPG":
      FileType = JPEGFile;
      break;
    case "TIFF":
    case "TIF":
      FileType = TIFFFile;
      break;
  }

  const file = new FileType(data);
  file.file = filename;
  return file;
}
