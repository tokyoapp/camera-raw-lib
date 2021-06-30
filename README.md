# camera-raw-lib

### Return data format of ```getImageData()```

```javascript
return {
    orientation: Number, // TIFF orientation tag value
    format: String, // "RGB" or "RGBA"
    bitsPerSample: Number, // 8, 16 or 32
    data: ArrayBuffer, // ArrayBuffer of image data in format above
    width: Number, // width of image in pixels
    height: Number, // height of image in pixels
}
```
