var canvas = document.getElementById('application');
var app = new pe.Application(canvas, {
    mouse: new pc.Mouse(canvas),
    touch: 'ontouchstart' in window ? new pc.TouchDevice(canvas) : null
});
app.enhance();

var cubemap = {
    name: 'Helipad',
    cubemap: './assets/cubemaps/Helipad.dds',
    textures: [{
            url: './assets/cubemaps/Helipad_posx.png'
        },
        {
            url: './assets/cubemaps/Helipad_negx.png'
        },
        {
            url: './assets/cubemaps/Helipad_posy.png'
        },
        {
            url: './assets/cubemaps/Helipad_negy.png'
        },
        {
            url: './assets/cubemaps/Helipad_posz.png'
        },
        {
            url: './assets/cubemaps/Helipad_negz.png'
        }
    ]
};

var model = {
    uid: "4ae5a885-992b-40a7-a64c-1ee7b2d854d9",
    url: "./assets/models/playcanvas/playcanvas.json",
    mapping: [ "metal-silver", "plastic-orange" ],
    textures: [
        { name: "plastic_ao.jpg", url: "./assets/models/playcanvas/plastic_ao.jpg" },
        { name: "metal_ao.jpg", url: "./assets/models/playcanvas/metal_ao.jpg" },
        { name: "metal_gloss.png", url: "./assets/models/playcanvas/metal_gloss.png" },
        { name: "plastic_gloss.png", url: "./assets/models/playcanvas/plastic_gloss.png" },
        { name: "plastic_normals.png", url: "./assets/models/playcanvas/plastic_normals.png" }
    ],
    materials: [{
        "name": "plastic-orange",
        "ambient": [0, 0, 0, 1],
        "aoMap": "plastic_ao.jpg",
        "aoMapChannel": "r",
        "aoMapUv": 1,
        "bumpMapFactor": 0.7,
        "diffuse": [0.95686274766922, 0.43529412150382996, 0.05882352963089943, 1],
        "emissive": [0.929411768913269, 0.43529412150382996, 0.1882352977991104, 1],
        "emissiveIntensity": 0.07,
        "glossMap": "plastic_gloss.png",
        "glossMapChannel": "r",
        "heightMapChannel": "r",
        "metalness": 0,
        "metalnessMapChannel": "r",
        "normalMap": "plastic_normals.png",
        "opacityMapChannel": "r",
        "shadowSampleType": 1,
        "shininess": 100,
        "specular": [0.23000000417232513, 0.23000000417232513, 0.23000000417232513, 1],
        "specularAntialias": true,
        "useMetalness": true
    }, {
        "name": "metal-silver",
        "ambient": [
            0,
            0,
            0,
            1
        ],
        "aoMap": "metal_ao.jpg",
        "aoMapChannel": "r",
        "bumpMapFactor": 0.5,
        "glossMap": "metal_gloss.png",
        "glossMapChannel": "r",
        "heightMapChannel": "r",
        "metalnessMapChannel": "r",
        "normalMap": "metal_normals.png",
        "normalMapTiling": [
            0.5,
            0.5
        ],
        "opacityMapChannel": "r",
        "shadowSampleType": 1,
        "shininess": 84.78,
        "specular": [
            0.23000000417232513,
            0.23000000417232513,
            0.23000000417232513,
            1
        ],
        "specularAntialias": true,
        "specularMap": "metal_gloss.png",
        "useMetalness": true
    }]
};

var orbitCamera = new pe.scripts.OrbitCamera(app);
var orbitCameraMouseInput = new pe.scripts.OrbitCameraMouseInput(app);
var orbitCameraTouchInput = new pe.scripts.OrbitCameraTouchInput(app);

var camera = new pe.Camera({
    name: 'camera',
    position: [0, 0, 10]
});
var cube = new pe.Model({
    name: 'cube',
    position: [0, 0, 0],
    rotation: [45, 45, 45],
    type: 'asset'
});
var light = new pe.Light({
    name: 'light',
    position: [1, 1, 1],
    rotation: [45, 45, 45],
    type: 'point'
});

camera.entity.addComponent('script');
camera.entity.script.create('orbitCamera');
camera.entity.script.create('orbitCameraMouseInput');
camera.entity.script.create('orbitCameraTouchInput');

app.models.add(model);
app.cubemaps.add(cubemap);
Promise.all([
    app.models.load(model.uid),
    app.cubemaps.load('Helipad', { loadFaces: false })
]).then(res => {
    cube.entity.model.asset = res[0];
    app.$.root.addChild(camera.entity);
    app.$.root.addChild(cube.entity);
    app.$.root.addChild(light.entity);
    app.$.scene.skyboxIntensity = 2;
    app.$.scene.skyboxMip = 2;
    app.$.scene.setSkybox(res[1].resources);

    camera.entity.script.orbitCamera.focus(cube.entity);
});
