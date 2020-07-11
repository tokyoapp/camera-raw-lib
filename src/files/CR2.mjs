import DNGFile from "./DNG.mjs";

export default class CR2File extends DNGFile {
  get type() { return "CR2"; }

  static handleJPEGImage(tags, image) {
    image.imageData = image.strips[0];
    image.type = "jpeg";
  }
}
