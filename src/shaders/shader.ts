export default function createShader(shaderDefinition: any) {
    return (graphicsDevice: pc.GraphicsDevice) => {
        shaderDefinition.fshader = `precision ${graphicsDevice.precision} float;\n` + shaderDefinition.fshader;
        return new pc.Shader(graphicsDevice, shaderDefinition);
    };
}
