import DNGFile from "./DNG.mjs";

export default class ARWFile extends DNGFile {
  type = "ARW";

  static handleJPEGImage(tags, image) {
    image.type = "jpeg";
  }
}
