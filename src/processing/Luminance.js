export default {
  name: 'Luminance',
  attributes: {},
  glsl: `
    void Luminance(inout vec4 outColor) {}

    float luminance(vec3 rgb) {
      return (0.2126 * rgb.r) + (0.7152 * rgb.r) + (0.0722 * rgb.r);
    }
  `
}