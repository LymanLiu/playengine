export default function enhance() {
    pc.Texture.prototype.toJSON = (function() {
        let fields = [
            "name",
            "width",
            "height",
            "depth",
            "format",
            "minFilter",
            "magFilter",
            "anisotropy",
            "addressU",
            "addressV",
            "addressW",
            "mipmaps",
            "cubemap",
            "volume",
            "rgbm",
            "fixCubemapSeams",
            "flipY",
            "compareOnRead",
            "compareFunc"
        ];

        var defaultTexture = toJSON.call(new pc.Texture(pc.Application.getApplication().graphicsDevice));

        function toJSON(options: pc.ToJSONOptions = {}): object {
            let result: any = { url: null };
            let element: HTMLImageElement | HTMLCanvasElement = this._levels[0];

            if (element instanceof HTMLImageElement) {
                result.url = element.getAttribute('src');
            } else if (element instanceof HTMLCanvasElement) {
                result.url = element.toDataURL();
            }

            fields.forEach(field => {
                result[field] = this[field];
            });

            if (options.diff) {
                fields.forEach(field => {
                    let value1 = defaultTexture[field];
                    let value2 = this[field];

                    if (value1 === value2) {
                        delete result[field];
                    }
                })
            }

            return result;
        }

        return toJSON;
    })();
}
