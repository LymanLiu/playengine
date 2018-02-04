let MATERIAL_COLOR_FIELDS = [
    "diffuse", "specular", "ambient", "emissive"
];

let MATERIAL_VECTOR_FIELDS = [
    // vec2
    "diffuseMapOffset", "diffuseMapTiling",
    "opacityMapOffset", "opacityMapTiling",
    "aoMapOffset", "aoMapTiling",
    "specularMapOffset", "specularMapTiling",
    "metalnessMapOffset", "metalnessMapTiling",
    "glossMapOffset", "glossMapTiling",
    "heightMapOffset", "heightMapTiling",
    "emissiveMapOffset", "emissiveMapTiling",
    "normalMapOffset", "normalMapTiling",
    "lightMapOffset", "lightMapTiling",
];

export let MATERIAL_OBJECT_FIELDS = [
    "cubeMapProjectionBox"
];
export let MATERIAL_OBJECT_FIELDS2 = MATERIAL_OBJECT_FIELDS.reduce((prev: any, next: string) => {
    prev[next] = true;
    return prev;
}, {});

export let MATERIAL_ARRAY_FIELDS = MATERIAL_COLOR_FIELDS.concat(MATERIAL_VECTOR_FIELDS);
export let MATERIAL_ARRAY_FIELDS2 = MATERIAL_ARRAY_FIELDS.reduce((prev: any, next: string) => {
    prev[next] = true;
    return prev;
}, {});

export let MATERIAL_TEXTURE_FIELDS = [
    "aoMap", "diffuseMap", "glossMap", "metalnessMap",
    "specularMap", "emissiveMap", "opacityMap", "lightMap",
    "normalMap", "heightMap", "sphereMap", "cubeMap"
];

export let MATERIAL_TEXTURE_FIELDS2 = MATERIAL_TEXTURE_FIELDS.reduce((prev: any, next: string) => {
    prev[next] = true;
    return prev;
}, {});

export let ENTITY_BASE = "entity";
export let ENTITY_CAMERA = "camera";
export let ENTITY_LIGHT = "light";
export let ENTITY_MODEL = "model";

export default {
    ENTITY_BASE,
    ENTITY_CAMERA,
    ENTITY_LIGHT,
    ENTITY_MODEL,
    MATERIAL_OBJECT_FIELDS,
    MATERIAL_OBJECT_FIELDS2,
    MATERIAL_ARRAY_FIELDS,
    MATERIAL_ARRAY_FIELDS2,
    MATERIAL_TEXTURE_FIELDS,
    MATERIAL_TEXTURE_FIELDS2
};
