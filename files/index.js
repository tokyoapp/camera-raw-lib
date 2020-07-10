import TIFFFile from './TIFF.mjs';
import DNGFile from './DNG.mjs';
import CR2File from './CR2.mjs';
import CR3File from './CR3.mjs';
import ARWFile from './ARW.mjs';
import NEFFile from './NEF.mjs';

export function fetchImageFile(filePath) {
  return fetch(filePath).then(async res => {
    const data = await res.arrayBuffer();
    return parseImageFile(filePath, data);
  });
}

export function parseImageFile(filename, data) {
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
    case "TIFF":
    case "TIF":
      FileType = TIFFFile;
      break;
  }

  const file = new FileType(data);
  file.file = filename;
  return file;
}
