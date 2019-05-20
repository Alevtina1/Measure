import _ from 'lodash';
import THREE from '../lib/mapControls.js';

class Canvas3D {
  constructor (selector) {
    this.domElement = document.querySelector(selector);

    this.width = 1350;//this.domElement.innerWidth;
    this.height = 887;//this.domElement.innerHeight;
    this.alpha = 0;
    this.betha = 0;
    this.radius = 10;
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer();
    this.camera = new THREE.PerspectiveCamera(75, this.width/this.height, 0.1, 1000);
    // this.camera = new THREE.OrthographicCamera(-10*this.width/2, 10*this.width/2, this.height/2, -this.height/2, 1, 1000);
    // this.scene.add(this.camera);
    this.controls = new THREE.MapControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;
    this.controls.screenSpacePanning = true;
    this.controls.minDistance = 0;
    this.controls.maxDistance = 5000;
    this.controls.maxPolarAngle = Math.PI/2;

    this.configCamera();
    this.prepareAxes();
    this.prepareLight();
  }

  configCamera () {
    this.camera.position.set(0, 0, 5);
    this.camera.lookAt(0, 0, 0);
  }

  prepareLight () {
    const lightX = new THREE.SpotLight( 0xffeeee );
    const lightY = new THREE.SpotLight( 0xeeffee );
    const lightZ = new THREE.SpotLight( 0xeeeeff );
    const overallLight = new THREE.SpotLight( 0xffffff );

    lightX.position.set( 10, 0, 0 );
    lightY.position.set( 0, 10, 0 );
    lightZ.position.set( 0, 0, 10 );
    overallLight.position.set(-10, -10, -10);

    this.scene.add(lightX);
    this.scene.add(lightY);
    this.scene.add(lightZ);
    this.scene.add(overallLight);
  }

  prepareAxes () {
    const materialX = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const materialY = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    const materialZ = new THREE.LineBasicMaterial({ color: 0x0000ff });

    const geometryX = new THREE.Geometry();
    const geometryY = new THREE.Geometry();
    const geometryZ = new THREE.Geometry();

    geometryX.vertices.push(new THREE.Vector3(0, 0, 0));
    geometryX.vertices.push(new THREE.Vector3(-10, 0, 0));
    geometryY.vertices.push(new THREE.Vector3(0, 0, 0));
    geometryY.vertices.push(new THREE.Vector3(0, 10, 0));
    geometryZ.vertices.push(new THREE.Vector3(0, 0, 0));
    geometryZ.vertices.push(new THREE.Vector3(0, 0, 10));

    this.scene.add(new THREE.Line(geometryX, materialX));
    this.scene.add(new THREE.Line(geometryY, materialY));
    this.scene.add(new THREE.Line(geometryZ, materialZ));
  }

  addCube (d, startX, startY, startZ=0, color=0x454545) {
    const geometry = new THREE.CubeGeometry(d, startZ || 0.000001, d);
    const material = new THREE.MeshLambertMaterial({ color });
    const cube = new THREE.Mesh(geometry, material);

    cube.position.set(-startX-d/2, startZ/2, startY+d/2);//startZ+d/2);

    if (!this.cubes) {
      this.cubes = [];
    }
    this.cubes.push(cube);

    this.scene.add(cube);
  }

  addSky () {
    const geometry = new THREE.CubeGeometry(200, 200, 200);
    const material = new THREE.MeshBasicMaterial({ color: '#ffffff' });
    const cube = new THREE.Mesh(geometry, material);
    const cube1 = new THREE.Mesh(geometry, material);
    const cube2 = new THREE.Mesh(geometry, material);
    const cube3 = new THREE.Mesh(geometry, material);
    const cube4 = new THREE.Mesh(geometry, material);
    const cube5 = new THREE.Mesh(geometry, material);

    cube.position.set(0, 0, 200);
    cube1.position.set(0, 0, -200);
    cube2.position.set(0, 200, 0);
    cube3.position.set(0, -200, 0);
    cube4.position.set(200, 0, 0);
    cube5.position.set(-200, 0, 0);

    if (!this.cubes) {
      this.cubes = [];
    }
    this.cubes.push(cube);
    this.cubes.push(cube1);
    this.cubes.push(cube2);
    this.cubes.push(cube3);
    this.cubes.push(cube4);
    this.cubes.push(cube5);

    this.scene.add(cube);
    this.scene.add(cube1);
    this.scene.add(cube2);
    this.scene.add(cube3);
    this.scene.add(cube4);
    this.scene.add(cube5);
  }

  addProjectiveItem (d, height, startX, startY, startZ) {
    const geometry = new THREE.BoxGeometry(d, d, height);
    const material = new THREE.MeshLambertMaterial({ color: '#aaaaaa' });
    const cube = new THREE.Mesh(geometry, material);

    cube.position.set(-startX-d/2, startZ+height/2, startY+d/2);//startZ+d/2);

    // if (!this.cubes) {
    //   this.cubes = [];
    // }
    // this.cubes.push(cube);

    this.scene.add(cube);
  }

  createWeb (startX, startY, startZ, neighbours, frameMode = false) {
    if (frameMode) {
      Object.values(neighbours).forEach((n) => {
        const geometry = new THREE.Geometry();
        geometry.vertices.push(
          new THREE.Vector3(-startX, startZ, startY),
          new THREE.Vector3(-n.x, n.z, n.y)
        );
        const material = new THREE.LineBasicMaterial({ color: 0x565656 });
        const line = new THREE.Line(geometry, material);

        this.scene.add(line);
      });

      return;
    }
    const createTriangle = (n, m) => {
      const geometry = new THREE.Geometry();
      geometry.vertices.push(
        new THREE.Vector3(-startX, startZ, startY),
        new THREE.Vector3(-n.x, n.z, n.y),
        new THREE.Vector3(-m.x, m.z, m.y),
      );
      geometry.faces.push(new THREE.Face3(0, 1, 2))
      geometry.computeFaceNormals();
      const material = new THREE.MeshLambertMaterial({ color: 0x56565656 });
      const triangle = new THREE.Mesh(geometry, material);

      this.scene.add(triangle);
    }

    if (neighbours.top && neighbours.right) {
      createTriangle(neighbours.top, neighbours.right);
    }
    if (neighbours.bottom && neighbours.right) {
      createTriangle(neighbours.bottom, neighbours.right);
    }
    if (neighbours.bottom && neighbours.left) {
      createTriangle(neighbours.bottom, neighbours.left);
    }
    if (neighbours.top && neighbours.left) {
      createTriangle(neighbours.top, neighbours.left);
    }
  }

  renderSymbolicImage (symbolicImage, frameMode = false) {
    let scaleColor;
    let drawedCount = 0;
    const itemSize = symbolicImage.final ? symbolicImage.d : symbolicImage.secondaryImage.d;
    const items = symbolicImage.final ? symbolicImage.colorizedItems : symbolicImage.secondaryImage.colorizedItems;
    const flows = symbolicImage.final ? symbolicImage.flows : symbolicImage.secondaryImage.flows;
    const normalizedFlows = symbolicImage.final ? symbolicImage.normalizedFlows : symbolicImage.secondaryImage.normalizedFlows;
    const toDrawCount = items.length;

    //this.drawGrid(symbolicImage);
    this.addSky();
    console.log(symbolicImage);
    console.log('IMAGE SIZE: ', toDrawCount);
    console.log(items);
    _.forEach(items, (item) => {
      if (!symbolicImage.excluded.includes(item.item.id)) {
        const neighbours = {};
        this.addCube(itemSize, item.item.startX, item.item.endY, 0, item.color);
        if (item.item.projectiveImage) {
          _.forEach(item.item.projectiveImage.restItems, (projItem) => {
            this.addProjectiveItem(itemSize, projItem.endAngle - projItem.startAngle, item.item.startX, item.item.endY, projItem.startAngle);
          });
        }
        if (flows && flows[item.item.id]) {
          // this.addCube(itemSize, item.item.startX, item.item.endY, normalizedFlows[item.item.id], 0xffffff);
          Object.keys(item.item.neighbours).forEach((neighbourKey) => {
            const neighbour = item.item.neighbours[neighbourKey];
            if (flows[neighbour.id]) {
              neighbours[neighbourKey] = ({ x: neighbour.startX + itemSize/2, y: neighbour.endY + itemSize/2, z: normalizedFlows[neighbour.id] });
            }
          });
          this.createWeb(item.item.startX + itemSize/2, item.item.endY + itemSize/2, normalizedFlows[item.item.id], neighbours, frameMode);
        }
        drawedCount += 1;
        if (drawedCount % 100 === 0) {
          console.log(`DRAWED: ${drawedCount}/${toDrawCount}`);
        }
      }
    });

    this.render();
  }

  render () {
    this.renderer.render(this.scene, this.camera);
  }

  animate () {
    this.renderer.render(this.scene, this.camera);

    // this.camera.position.set(
    //   this.radius*Math.cos(this.betha)*Math.cos(this.alpha),
    //   this.radius*Math.cos(this.betha)*Math.sin(this.alpha),
    //   this.radius*Math.sin(this.betha)
    // );
    // this.camera.lookAt(0, 0, 0);
    this.controls.update();

    requestAnimationFrame(() => this.animate());
  }

  unmount () {
    document.querySelector('#main-screen').style['display'] = 'block';
    document.querySelector('.canvas').removeChild(
      document.querySelector('.canvas canvas:last-child')
    );
  }

  mount () {
    this.renderer.setSize(this.width, this.height);
    document.querySelector('#main-screen').style['display'] = 'none';

    // document.body.addEventListener('keydown', (event) => {
    //   console.log(event);
    //   switch(event.code) {
    //     case 'ArrowUp':
    //       if (event.ctrlKey) {
    //         if (event.altKey) {
    //           this.alpha += 0.1;
    //         }
    //         this.alpha += 0.01;
    //         break;
    //       }
    //       this.radius -= 0.1;
    //       break;
    //     case 'ArrowDown':
    //       if (event.ctrlKey) {
    //         if (event.altKey) {
    //           this.alpha -= 0.1;
    //         }
    //         this.alpha -= 0.01;
    //         break;
    //       }
    //       this.radius += 0.1;
    //       break;
    //     case 'ArrowLeft':
    //       if (event.altKey) {
    //         this.betha -= 0.1;
    //       }
    //       this.betha -= 0.01;
    //       break;
    //     case 'ArrowRight':
    //       if (event.altKey) {
    //         this.betha += 0.1;
    //       }
    //       this.betha += 0.01;
    //       break;
    //   }
    // });
    document.querySelector('.canvas').appendChild(this.renderer.domElement);

    this.animate();
    // this.domElement.appendChild(this.renderer.domElement);
  }
}

export default Canvas3D;
