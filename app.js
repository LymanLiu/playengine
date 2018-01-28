var canvas = document.getElementById('application');
var app = new pe.Application(canvas, {
    mouse: new pc.Mouse(canvas),
    touch: 'ontouchstart' in window ? new pc.TouchDevice(canvas) : null
});
app.enhance();
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

Promise.all([
    fetch('./assets/cubemaps/data.json').then(res => res.json()),
    fetch('./assets/models/playcanvas/data.json').then(res => res.json()),
]).then(res => {
    var cubemap = res[0];
    var model = res[1];

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
        app.$.scene.skyboxIntensity = 1;
        app.$.scene.skyboxMip = 1;
        app.$.scene.abmientLight = new pc.Color(0.2, 0.2, 0.2);
        app.$.scene.gammaCorrection = 2;
        app.$.scene.toneMapping = 3;
        app.$.scene.setSkybox(res[1].resources);

        camera.entity.script.orbitCamera.focus(cube.entity);
    });
});
