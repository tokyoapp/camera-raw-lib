export default {
  name: 'Saturation',
  attributes: {
    saturation: {
      type: 'float',
      value: 1,
      min: 0,
      max: 10,
    }
  },
  glsl: `
    vec3 saturate(vec3 rgb, float adjustment) {
      const vec3 W = vec3(0.2125, 0.7154, 0.0721);
      vec3 intensity = vec3(dot(rgb, W));
      return mix(intensity, rgb, adjustment);
    }

    void Saturation(inout vec4 outColor) {
      vec3 color = saturate(outColor.rgb, saturation);
      outColor.rgb = color.rgb;
    }
  `
}