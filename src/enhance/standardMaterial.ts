import {
    MATERIAL_TEXTURE_FIELDS2,
    MATERIAL_OBJECT_FIELDS2,
    MATERIAL_ARRAY_FIELDS2
} from '../constants';

export default function enhance() {

    pc.StandardMaterial.prototype.toJSON = (function() {

        var fields : string[] = [
            'alphaTest', 'alphaToCoverage',
            'ambient', 'ambientTint',
            'aoMap', 'aoMapChannel', 'aoMapOffset', 'aoMapTiling',
            'aoMapUv', 'aoMapVertexColor',
            'blendType',
            'bumpiness',
            'conserveEnergy',
            'cubeMap', 'cubeMapProjection', 'cubeMapProjectionBox',
            'cull',
            'depthTest', 'depthWrite', 'diffuse',
            'diffuseMap', 'diffuseMapChannel', 'diffuseMapOffset', 'diffuseMapTiling',
            'diffuseMapTint', 'diffuseMapUv', 'diffuseMapVertexColor',
            'emissive', 'emissiveIntensity', 'emissiveMap',
            'emissiveMapChannel', 'emissiveMapOffset', 'emissiveMapTiling',
            'emissiveMapTint', 'emissiveMapUv', 'emissiveMapVertexColor',
            'fresnelModel',
            'glossMap', 'glossMapChannel', 'glossMapOffset', 'glossMapTiling',
            'glossMapUv', 'glossMapVertexColor',
            'heightMap', 'heightMapChannel', 'heightMapFactor',
            'heightMapOffset', 'heightMapTiling', 'heightMapVertexColor', 'heightMapUv',
            'lightMap', 'lightMapChannel', 'lightMapOffset',
            'lightMapTiling', 'lightMapUv', 'lightMapVertexColor',
            'metalness', 'metalnessMap', 'metalnessMapChannel',
            'metalnessMapOffset', 'metalnessMapTiling',
            'metalnessMapUv', 'metalnessMapVertexColor',
            'name',
            'normalMap', 'normalMapOffset', 'normalMapTiling',
            'normalMapUv', 'normalMapVertexColor',
            'occludeSpecular', 'occludeSpecularIntensity',
            'opacity', 'opacityMap', 'opacityMapChannel',
            'opacityMapOffset', 'opacityMapTiling',
            'opacityMapUv', 'opacityMapVertexColor',
            'reflectivity', 'refraction', 'refractionIndex',
            'shadingModel',
            'shadowSampleType',
            'shininess',
            'specular', 'specularAntialias', 'specularMap',
            'specularMapChannel', 'specularMapOffset', 'specularMapTiling',
            'specularMapTint', 'specularMapUv', 'specularMapVertexColor', 'sphereMap',
            'useFog', 'useGammaTonemap', 'useLighting',
            'useMetalness', 'useSkybox',
        ];

        var defaultMaterial = toJSON.call(pc.ModelHandler.DEFAULT_MATERIAL);

        function toJSON(options: any = {}) {
            var result : any = {};
            var self = this;

            fields.forEach(function(field) {
                // texture
                if (MATERIAL_TEXTURE_FIELDS2[field]) {

                    if (self[field] !== null) {
                        result[field] = self[field].name;
                    } else {
                        result[field] = null;
                    }

                    // color or vector
                } else if (MATERIAL_ARRAY_FIELDS2[field]) {

                    result[field] = Array.from(self[field].data);

                } else if (MATERIAL_OBJECT_FIELDS2[field]) {

                    result[field] = self[field] ? self[field].toJSON() : null;

                    // atom
                } else {

                    if (field === 'bumpiness') {
                        result['bumpMapFactor'] = self[field];
                    } else {
                        result[field] = self[field];
                    }
                }
            });

            if (options.diff) {
                fields.forEach(function(field) {

                    if (field === 'bumpiness') {
                        field = 'bumpMapFactor';
                    }

                    var value1 = defaultMaterial[field];
                    var value2 = result[field];

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
