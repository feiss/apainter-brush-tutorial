AFRAME.registerBrush(
  'simpleline', 
  {
    init: function(color, width) {
      // line material
      this.material = new THREE.LineBasicMaterial({color: this.data.color});

      // the geometry of the line is a BufferGeometry. It's data is contained in buffer this.vertices
      this.geometry = new THREE.BufferGeometry();

      // init draw range to 0 vertices
      this.geometry.setDrawRange(0, 0); 

      // we will hold the position of all the vertices of this line in this array
      this.vertices = new Float32Array(this.options.maxPoints * 3);

      // link the vertices array to the geometry
      this.geometry.addAttribute('position', new THREE.BufferAttribute(this.vertices, 3).setDynamic(true));

      // create the line mesh 
      var line = new THREE.Line(this.geometry, this.material); 

      // don't hide the line if some part of it is out of sight
      line.frustumCulled = false;

      // add the line as a child to the object3D of this a-entity
      this.object3D.add(line); 
    },
    addPoint: function(position, orientation, pointerPosition, pressure, timestamp) { 
      // add new vertex to array
      this.vertices[this.data.numPoints * 3 + 0] = pointerPosition.x; 
      this.vertices[this.data.numPoints * 3 + 1] = pointerPosition.y; 
      this.vertices[this.data.numPoints * 3 + 2] = pointerPosition.z; 

      // tell threejs to update vertices
      this.geometry.attributes.position.needsUpdate = true; 

      // update range of vertices to paint
      this.geometry.setDrawRange(0, this.data.numPoints);

      // vertex added!
      return true; 
    },
    tick: function(time, delta) {
      // add some random value to each vertex xyz component
      for (var i = 0; i < this.data.numPoints * 3; i++) {
        this.vertices[i] += Math.random() * 0.001 - 0.0005;
      }
      // tell threejs to update vertices
      this.geometry.attributes.position.needsUpdate = true; 
    }
  }, 
  {
    thumbnail: 'brushes/thumb_simpleline.png',
    maxPoints: 1000,
    spacing: 0
  }
);