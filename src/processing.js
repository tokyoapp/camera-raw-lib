export const processingSteps = [
    {
        name: 'Saturation',
        attributes: {
            saturation: {
                type: 'float',
                value: .5,
                min: 0,
                max: 1,
            }
        },
        glsl: `
            void Saturation(inout vec4 outColor) {
                outColor.r *= saturation;
            }
        `
    }
]