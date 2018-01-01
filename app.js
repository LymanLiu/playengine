var canvas = document.getElementById('application');
var app = new pe.Application(canvas, {
    mouse: new pc.Mouse(canvas)
});
new pe.scripts.OrbitCamera(app);
new pe.scripts.OrbitCameraMouseInput(app);
new pe.scripts.OrbitCameraTouchInput(app);

var camera = new pe.Camera({
    name: 'camera',
    position: [0, 0, 10]
});
var cube = new pe.Model({
    name: 'cube',
    position: [0, 0, 0],
    rotation: [45, 45, 45],
    type: 'box'
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

app.$.root.addChild(camera.entity);
app.$.root.addChild(cube.entity);
app.$.root.addChild(light.entity);
