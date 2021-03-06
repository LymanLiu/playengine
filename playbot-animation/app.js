var canvas = document.getElementById('application');
var app = new pe.Application(canvas, {
    mouse: new pc.Mouse(canvas),
    touch: 'ontouchstart' in window ? new pc.TouchDevice(canvas) : null
});
app.enhance().autoResize();
var orbitCamera = new pe.scripts.OrbitCamera(app);
var orbitCameraMouseInput = new pe.scripts.OrbitCameraMouseInput(app);
var orbitCameraTouchInput = new pe.scripts.OrbitCameraTouchInput(app);

var camera = new pe.Camera({
    name: 'camera',
    position: [0, 0, 10]
});
var light = new pe.Light({
    name: 'light',
    position: [1, 1, 1],
    rotation: [45, 45, 45],
    type: 'point'
});

Promise.all([
    fetch('../assets/cubemaps/data.json').then(res => res.json()),
    fetch('../assets/models/playbot/data.json').then(res => res.json()),
]).then(res => {
    var cubemapData = res[0];
    var modelData = res[1];

    camera.entity.addComponent('script');
    camera.entity.script.create('orbitCamera');
    camera.entity.script.create('orbitCameraMouseInput');
    camera.entity.script.create('orbitCameraTouchInput');

    app.models.add(modelData);
    app.cubemaps.add(cubemapData);
    Promise.all([
        app.models.load(modelData.uid, {
            loadAnimations: false
        }),
        app.cubemaps.load('Helipad', {
            loadFaces: false
        })
    ]).then(res => {
        var modelAsset = res[0];
        var playbot = new pe.Model({
            name: 'playbot',
            asset: modelAsset,
            animations: {
                activate: true,
                cycleMode: 'all',
                assets: modelAsset.data.animations
            }
        });
        app.$.root.addChild(camera.entity);
        app.$.root.addChild(playbot.entity);
        app.$.root.addChild(light.entity);
        app.$.scene.setSkybox(res[1].resources);

        camera.entity.script.orbitCamera.focus(playbot.entity);
    });
});
