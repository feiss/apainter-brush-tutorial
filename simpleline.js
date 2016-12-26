AFRAME.registerBrush(
  'simpleline', 
  {
    init: function(color, width) {
      this.material = new THREE.LineBasicMaterial({color: this.data.color});
    },
    addPoint: function(position, orientation, pointerPosition, pressure, timestamp) { 
      if (this.data.prevPointerPosition) { // if it is the first point, there's no line to paint
        var lineGeometry = new THREE.Geometry();
        lineGeometry.vertices.push(pointerPosition.clone(), this.data.prevPointerPosition.clone()); // line from current position to the previous one
        var line = new THREE.Line(lineGeometry, this.material); // create the line mesh 
        this.object3D.add(line); // add it to the stroke entity
      }
      return true; // point added!
    },
    tick: function(time, delta) {
      var rnd1 = new THREE.Vector3(Math.random() * 0.001 - 0.0005, Math.random() * 0.001 - 0.0005, Math.random() * 0.001 - 0.0005);
      for (var i = 0; i < this.object3D.children.length; i++) {
        var rnd2 = new THREE.Vector3(Math.random() * 0.001 - 0.0005, Math.random() * 0.001 - 0.0005, Math.random() * 0.001 - 0.0005);
        this.object3D.children[i].geometry.vertices[0].add(rnd2);
        this.object3D.children[i].geometry.vertices[1].add(rnd1);
        rnd1 = rnd2;
        this.object3D.children[i].geometry.verticesNeedUpdate = true;
      }
    }
  }, 
  {
    thumbnail: 'brushes/thumb_simpleline.png',
    maxPoints: 1000,
    spacing: 0
  }
);