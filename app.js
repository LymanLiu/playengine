var canvas = document.getElementById('application');
var app = new pe.Application(canvas, {});
var camera = new pe.Camera({
    position: [0, 0, 10]
});
var cube = new pe.Model({
    position: [0, 0, 0],
    rotation: [45, 45, 45],
    type: 'box'
});
var light = new pe.Light({
    position: [1, 1, 1],
    rotation: [45, 45, 45],
    type: 'point'
});

app.$.root.addChild(camera.entity);
app.$.root.addChild(cube.entity);
app.$.root.addChild(light.entity);
