var canvas = document.getElementById('application');
var app = new pe.Application(canvas, {
    mouse: new pc.Mouse(canvas),
    touch: 'ontouchstart' in window ? new pc.TouchDevice(canvas) : null,
    keyboard: new pc.Keyboard(window)
});
app.enhance().autoResize();
app.gizmos.create('grid');
app.gizmos.create('aabb');
app.gizmos.create('transform');

var isCameraMoving = false;
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
var cube = new pe.Model({
    name: 'cube',
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    type: 'box'
});
var cube2 = new pe.Model({
    name: 'cube',
    position: [0, 0, 3],
    rotation: [0, 0, 0],
    type: 'box'
});
var cube3 = new pe.Model({
    name: 'cube',
    position: [0, 0, -3],
    rotation: [0, 0, 0],
    type: 'box'
});
var cube4 = new pe.Model({
    name: 'cube',
    position: [-3, 0, 0],
    rotation: [0, 0, 0],
    type: 'box'
});
var cube5 = new pe.Model({
    name: 'cube',
    position: [3, 0, 0],
    rotation: [0, 0, 0],
    type: 'box'
});

camera.entity.addComponent('script');
camera.entity.script.create('orbitCamera');
camera.entity.script.create('orbitCameraMouseInput');
camera.entity.script.create('orbitCameraTouchInput');

app.$.root.addChild(camera.entity);
app.$.root.addChild(light.entity);
app.$.root.addChild(cube.entity);
app.$.root.addChild(cube2.entity);
app.$.root.addChild(cube3.entity);
app.$.root.addChild(cube4.entity);
app.$.root.addChild(cube5.entity);

app.$.scene.skyboxIntensity = 1;
app.$.scene.skyboxMip = 1;
app.$.scene.abmientLight = new pc.Color(0.2, 0.2, 0.2);
app.$.scene.gammaCorrection = 2;
app.$.scene.toneMapping = 3;

camera.entity.script.orbitCamera.focus(cube.entity);
app.selection.attach(camera);
app.gizmos.grid.attach();

app.$.on('app:camera:move', function() {
    isCameraMoving = true;
});
app.$.on('app:camera:moveend', function() {
    isCameraMoving = false;
});
app.$.mouse.on('mouseup', function(e) {
    if (isCameraMoving) return;

    var target = app.selection.select(e.x, e.y);
    app.gizmos.aabb.detach();
    app.gizmos.transform.detach();

    if (target) {
        app.gizmos.aabb.attach(target);
        app.gizmos.transform.attach(target);
    }
});
app.$.keyboard.on('keydown', function(e) {
    switch (e.key) {
        case 49: // 1
            app.gizmos.transform.mode = 'translate';
            break;
        case 50: // 2
            app.gizmos.transform.mode = 'rotate';
            break;
        case 51: // 3
            app.gizmos.transform.mode = 'scale';
            break;
    }
});
