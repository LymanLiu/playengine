var canvas = document.getElementById('application');
var app = new pe.Application(canvas, {
    mouse: new pc.Mouse(canvas),
    touch: 'ontouchstart' in window ? new pc.TouchDevice(canvas) : null
});
app.enhance().autoResize();
app.gizmos.create('grid');
app.gizmos.grid.attach();

var gridSettings = {
    size: [5, 10, 15, 20, 25],
    divisions: [5, 10, 15, 20, 25],
    gridColor: [ [1,1,1,1], [1,0,0,1], [0,1,0,1], [0,0,1,1], [0,0,0,1] ].map(color => new pc.Color(color)),
    axisColor: [ [1,1,1,1], [1,0,0,1], [0,1,0,1], [0,0,1,1], [0,0,0,1] ].map(color => new pc.Color(color))
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
    rotation: [0, 0, 0]
});
var light = new pe.Light({
    name: 'light',
    position: [1, 1, 1],
    rotation: [45, 45, 45],
    type: 'point'
});

Promise.all([
    fetch('../assets/cubemaps/data.json').then(res => res.json()),
    fetch('../assets/models/playcanvas/data.json').then(res => res.json()),
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
        app.models.load(modelData.uid),
        app.cubemaps.load('Helipad', {
            loadFaces: false
        })
    ]).then(res => {
        cube.entity.model.asset = res[0];
        app.$.root.addChild(camera.entity);
        app.$.root.addChild(cube.entity);
        app.$.root.addChild(light.entity);
        app.$.scene.setSkybox(res[1].resources);

        camera.entity.script.orbitCamera.focus(cube.entity);

        setInterval(function() {
            app.gizmos.grid.size = gridSettings.size[Math.floor(Math.random() * 5)];
            app.gizmos.grid.divisions = gridSettings.divisions[Math.floor(Math.random() * 5)];
            app.gizmos.grid.gridColor = gridSettings.gridColor[Math.floor(Math.random() * 5)];
            app.gizmos.grid.axisColor = gridSettings.axisColor[Math.floor(Math.random() * 5)];
        }, 1000);
    });
});
