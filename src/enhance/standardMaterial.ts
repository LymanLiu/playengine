import {
    MATERIAL_TEXTURE_FIELDS2,
    MATERIAL_OBJECT_FIELDS2,
    MATERIAL_ARRAY_FIELDS2
} from "../constants";

export default function enhance() {

    pc.StandardMaterial.prototype.toJSON = (() => {

        let fields = [
            "alphaTest", "alphaToCoverage",
            "ambient", "ambientTint",
            "aoMap", "aoMapChannel", "aoMapOffset", "aoMapTiling",
            "aoMapUv", "aoMapVertexColor",
            "blendType",
            "bumpiness",
            "conserveEnergy",
            "cubeMap", "cubeMapProjection", "cubeMapProjectionBox",
            "cull",
            "depthTest", "depthWrite", "diffuse",
            "diffuseMap", "diffuseMapChannel", "diffuseMapOffset", "diffuseMapTiling",
            "diffuseMapTint", "diffuseMapUv", "diffuseMapVertexColor",
            "emissive", "emissiveIntensity", "emissiveMap",
            "emissiveMapChannel", "emissiveMapOffset", "emissiveMapTiling",
            "emissiveMapTint", "emissiveMapUv", "emissiveMapVertexColor",
            "fresnelModel",
            "glossMap", "glossMapChannel", "glossMapOffset", "glossMapTiling",
            "glossMapUv", "glossMapVertexColor",
            "heightMap", "heightMapChannel", "heightMapFactor",
            "heightMapOffset", "heightMapTiling", "heightMapVertexColor", "heightMapUv",
            "lightMap", "lightMapChannel", "lightMapOffset",
            "lightMapTiling", "lightMapUv", "lightMapVertexColor",
            "metalness", "metalnessMap", "metalnessMapChannel",
            "metalnessMapOffset", "metalnessMapTiling",
            "metalnessMapUv", "metalnessMapVertexColor",
            "name",
            "normalMap", "normalMapOffset", "normalMapTiling",
            "normalMapUv", "normalMapVertexColor",
            "occludeSpecular", "occludeSpecularIntensity",
            "opacity", "opacityMap", "opacityMapChannel",
            "opacityMapOffset", "opacityMapTiling",
            "opacityMapUv", "opacityMapVertexColor",
            "reflectivity", "refraction", "refractionIndex",
            "shadingModel",
            "shadowSampleType",
            "shininess",
            "specular", "specularAntialias", "specularMap",
            "specularMapChannel", "specularMapOffset", "specularMapTiling",
            "specularMapTint", "specularMapUv", "specularMapVertexColor", "sphereMap",
            "useFog", "useGammaTonemap", "useLighting",
            "useMetalness", "useSkybox",
        ];

        let defaultMaterial = toJSON.call(pc.ModelHandler.DEFAULT_MATERIAL);

        function toJSON(options: pc.ToJSONOptions = {}): object {
            let result: any = {};

            fields.forEach((field: string) => {
                // texture
                if (MATERIAL_TEXTURE_FIELDS2[field]) {

                    if (this[field] !== null) {
                        result[field] = this[field].name;
                    } else {
                        result[field] = null;
                    }

                    // color or vector
                } else if (MATERIAL_ARRAY_FIELDS2[field]) {

                    result[field] = Array.from(this[field].data);

                } else if (MATERIAL_OBJECT_FIELDS2[field]) {

                    result[field] = this[field] ? this[field].toJSON() : null;

                    // atom
                } else {

                    if (field === "bumpiness") {
                        result.bumpMapFactor = this[field];
                    } else {
                        result[field] = this[field];
                    }
                }
            });

            if (options.diff) {
                fields.forEach((field: string) => {

                    if (field === "bumpiness") {
                        field = "bumpMapFactor";
                    }

                    let value1 = defaultMaterial[field];
                    let value2 = result[field];

                    // test two array is equal or not
                    if (MATERIAL_ARRAY_FIELDS2[field]) {
                        value1 = value1.toString();
                        value2 = value2.toString();
                    }

                    if (MATERIAL_OBJECT_FIELDS2[field]) {
                        value1 = JSON.stringify(value1);
                        value2 = JSON.stringify(value2);
                    }

                    if (value1 === value2) {
                        delete result[field];
                    }
                });
            }

            return result;
        }

        return toJSON;
    })();

}
