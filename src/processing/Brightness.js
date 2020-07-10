export default {
  name: 'Brightness',
  attributes: {
    brightness: {
      type: 'float',
      value: 0,
      min: -1,
      max: 1,
    }
  },
  glsl: `
    void Brightness(inout vec4 outColor) {
      outColor.rgb += brightness;
    }
  `
}
