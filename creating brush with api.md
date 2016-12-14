# Creating a new A-Painter brush using the Brush API

In this tutorial we will take the minimum steps required to create a very simple brush. For example, a brush to draw simple lines. We will going to call it `simpleline`.

Requisites:

- Know how to program
- Know [ThreeJS](http://threejs.org????) basics
- [npm](http://????)


## Setup

First, you need to grab your own copy of A-Painter to your computer, so you can change its code. If you have `git` installed, you can easily do this by:

```bash
cd your/folder
git clone http://github.com/aframevr/a-painter.git
cd a-painter
```

If you don't have `git`, you can go to http://github.com/aframevr/a-painter, click on the green button "Clone or download", download the zip and unzip it wherever you want.

For running your local copy of A-Painter, you need `npm` installed. Just enter the directory where A-Painter is and run `npm start`. Then, open http://localhost:8080 with a [VR compatible browser](http://????).


## Creating an 'empty' brush


If we read the A-Painter [readme](https://github.com/aframevr/a-painter#a-painter), it says you need to implement this very simple interface:

```javascript
BrushInterface.prototype = {
  init: function (),
  addPoint: function (position, orientation, pointerPosition, pressure, timestamp) {},
  tick: function (timeOffset, delta) {}
};
```

A function for initialization, another for adding new 'points' to the stroke, and another for animating the brush if that would be the case.

So, let's start by creating the skeleton of the brush:

Create a file in `src/brushes/` called `simpleline.js`, paste this code and save it:

```javascript
AFRAME.registerBrush(
  'simpleline', 
  {
    init: function(color, width) {},
    addPoint: function(position, orientation, pointerPosition, pressure, timestamp) { return true; },
    tick: function(time, delta) {}
  }, 
  {
    thumbnail: '',
    maxPoints: 1000,
    spacing: 0
  }
);
```

This is the bare minimum. It does not paint anything, but A-Painter will accept it as a new brush. But before that, we need to add the `simpleline.js` to the list of files that need to be loaded when starting A-Painter. We do that by adding this line to `src/index.js`:

```javascript
require('./brushes/simpleline.js');
```

Now if you run your local A-Painter and test it with your HTC Vive or Oculus with controllers, you will find your new brush at the end of the list of brushes:

[GIF showing where is the new brush]


For testing back and forth is quite convenient to have the brush already selected by default. To do this, go to
`src/components/brush.js` and around line 6 change `brush: {default: 'line'}` by `brush : {default: 'simpleline'}`.


## Adding mojo

So, let's make our brush actually paint something. Every time you push the trigger to start a new stroke, A-Painter adds a new entity (an [A-Frame](http://aframe.io) `<a-entity>`) in the scene that will hold the geometry of the stroke. Then, A-Painter starts calling your `addPoint()` function each time the controller is moved more than `spacing` meters, so you can add stuff to your brush, grow the stroke or whatever your brush does. Normally, you will want to add or modify the 3D geometry of the brush, which can be accessed via `this.object3D`. In our case, for each new point we will draw a line from it to the previous one. The basic way of doing this is by creating new [THREE.lines](????) that will be added to the `object3D`.

[Diagram of the relationship among brush-stroke-entity-objectDefinition-object3d]



Go to our `simpleline.js` file and change the `addPoint()` function like this:


```javascript
addPoint: function(position, orientation, pointerPosition, pressure, timestamp) { 
  if (this.data.prevPoint) { // if it is the first point, there's no line to paint
    var lineGeometry = new THREE.Geometry();
    lineGeometry.vertices.push(pointerPosition, this.data.prevPoint); // line from current position to the previous one
    var lineMaterial = new THREE.LineBasicMaterial({color: this.data.color}); // create a material for the line with the current color selected
    var lineMesh = new THREE.Line(lineGeometry, lineMaterial); // create the line mesh 
    this.object3D.add(line); // add it to the stroke entity
  }
  return true; // point added!
},
```

The parameters passed to `addPoint()` represent the data of the new point, like its position, orientation, pressure of the trigger used (from 0 to 1) and the time it was made (in ms from the beginning of A-Painter). The difference between `position` and `pointerPosition` is that `position` refers to the center of the controller (more less above the trigger) and `pointerPosition` refers to the tip of the controller, from where the 'paint' is supposed to appear.

In your brush you may want to discard the new point that is being added. In that case, simply return `false`.

In our new `addPoint()`, we first check if `this.data.prevPoint` exists or not. If it does not it means that this is the first point, so we skip adding a new line (but we keep returning `true` so the point is added to the list of points of the stroke, and used in the next `addPoint()` as the first vertex of the first line).

Go try it!

[GIF of painting with the new brush]

## Caching

Since `addPoint()` is usually called hundreds of times for each stroke you make, you want it to be as fast as possible and avoid creating innecessary stuff. For this reason, it is a good decision to cache and reuse all you can. In our example, the material is the same for every line added to the stroke, so let's cache it. The `init()` function is perfect for this purpose for is it called just one time, at the beginning of the stroke:

```javascript
init: function () {
  this.material = new THREE.LineBasicMaterial({color: this.data.color});
}
```

and then change our `addPoint()`:

```javascript
addPoint: function(position, orientation, pointerPosition, pressure, timestamp) { 
  if (this.data.prevPoint) {
    var lineGeometry = new THREE.Geometry();
    lineGeometry.vertices.push(pointerPosition, this.data.prevPoint); // line from current position to the previous one
    var lineMesh = new THREE.Line(lineGeometry, this.material); // <- reusing the material
    this.object3D.add(line);
  }
  return true; 
},
```

in all our brush functions we have the object `this.data` available with many useful properties:

- **this.data.points**: list of points added to the stroke
- **this.data.numPoints**:  length of this.data.points
- **this.data.size**:  size of the stroke when it was created. Multiply it by `pressure` in `addPoint()` to get the current -pressure sensitive- size of the stroke
- **this.data.prevPoint**:  position of the last stroke
- **this.data.maxPoints**:  maximum number of points that we previously defined this brush can hold on each stroke
- **this.data.color**:  the color that was selected when the stroke started


## Alive brush

By using the function `tick()` we can animate the strokes of our brush in any way we want. This function is called continuously on every frame and receives two parameters: `time` and `delta`. The first is the number of ms passed since the beginning of A-Painter, and the second is the difference of ms between this call and the last tick. They are useful for making the animation time dependant and running at the same speed  of the 

Let's just add a simple little jitter to the lines:

```javascript
tick: function (time, delta) {
  for (var i = 0; i < this.object3D.children.length; i++) {
    this.object3D.children[i].geometry.vertices[0].add(Math.random() * 0.2, Math.random() * 0.2, Math.random() * 0.2);
    this.object3D.children[i].geometry.vertices[1].add(Math.random() * 0.2, Math.random() * 0.2, Math.random() * 0.2);
  }
}
```





