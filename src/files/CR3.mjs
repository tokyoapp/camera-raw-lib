import { BinaryFile } from "../../node_modules/@luckydye/binary-file-lib/index.mjs";
import RawImageData from "./RawImageData.mjs";

export default class CR3File extends BinaryFile {

  static get FileHeader() {
    return {
      size: 'int',
      type: 'char[4]',
      idk: 'unsigned char',
    }
  }

  static verifyFileHeader(file) {
    const header = this.unserialize(file, 0, this.FileHeader);

    console.log(header.data);

    return header;
  }

  static parseFile(file) {
    const time = performance.now();
    // read file header
    const header = this.verifyFileHeader(file);

    console.log('parseing took', performance.now() - time, 'ms');
  }

  getImageData() {
    const container = new RawImageData({
      orientation: 0,
      format: "RGB",
      bitsPerSample: 16,
      data: [],
      width: 1,
      height: 1,
    });

    return container;
  }

  getThumbnail() {
    return new Blob([], { type: 'image/jpeg' });
  }

}
