var MATERIAL_COLOR_FIELDS = [
    'diffuse', 'specular', 'ambient', 'emissive'
];

var MATERIAL_VECTOR_FIELDS = [
    // vec2
    'diffuseMapOffset', 'diffuseMapTiling',
    'opacityMapOffset', 'opacityMapTiling',
    'aoMapOffset', 'aoMapTiling',
    'specularMapOffset', 'specularMapTiling',
    'metalnessMapOffset', 'metalnessMapTiling',
    'glossMapOffset', 'glossMapTiling',
    'heightMapOffset', 'heightMapTiling',
    'emissiveMapOffset', 'emissiveMapTiling',
    'normalMapOffset', 'normalMapTiling',
    'lightMapOffset', 'lightMapTiling',
];

export var MATERIAL_OBJECT_FIELDS = [
    'cubeMapProjectionBox'
];
export var MATERIAL_OBJECT_FIELDS2 = MATERIAL_OBJECT_FIELDS.reduce(function(prev : any, next : string) {
    prev[next] = true;
    return prev;
}, {});

export var MATERIAL_ARRAY_FIELDS = MATERIAL_COLOR_FIELDS.concat(MATERIAL_VECTOR_FIELDS);
export var MATERIAL_ARRAY_FIELDS2 = MATERIAL_ARRAY_FIELDS.reduce(function(prev : any, next : string) {
    prev[next] = true;
    return prev;
}, {});

export var MATERIAL_TEXTURE_FIELDS = [
    'aoMap', 'diffuseMap', 'glossMap', 'metalnessMap',
    'specularMap', 'emissiveMap', 'opacityMap', 'lightMap',
    'normalMap', 'heightMap', 'sphereMap', 'cubeMap'
];

export var MATERIAL_TEXTURE_FIELDS2 = MATERIAL_TEXTURE_FIELDS.reduce(function(prev : any, next : string) {
    prev[next] = true;
    return prev;
}, {});

export default {
    MATERIAL_OBJECT_FIELDS,
    MATERIAL_OBJECT_FIELDS2,
    MATERIAL_ARRAY_FIELDS,
    MATERIAL_ARRAY_FIELDS2,
    MATERIAL_TEXTURE_FIELDS,
    MATERIAL_TEXTURE_FIELDS2
}
