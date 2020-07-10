import DNGFile from "./DNG.mjs";

export default class NEFFile extends DNGFile {
  static handleJPEGImage(tags, image) {
    image.type = "jpeg";
  }

  type = "NEF";
}
