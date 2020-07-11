import DNGFile from "./DNG.mjs";

export default class ARWFile extends DNGFile {
  get type() { return "ARW"; }

  static handleJPEGImage(tags, image) {
    image.type = "jpeg";
  }
}
