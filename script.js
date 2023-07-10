import * as THREE from 'https://unpkg.com/three@0.150.1/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.150.1/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

class Box extends THREE.Mesh {
  constructor({
    width,
    height,
    depth,
    color = '#00ff00',
    velocity = {
      x: 0,
      y: 0,
      z: 0
    },
    position = {
      x: 0,
      y: 0,
      z: 0
    }
  }) {
    super(
      new THREE.BoxGeometry(width, height, depth),
      new THREE.MeshStandardMaterial({ color })
    );

    this.width = width;
    this.height = height;
    this.depth = depth;

    this.position.set(position.x, position.y, position.z);

    this.right = this.position.x + this.width / 2;
    this.left = this.position.x - this.width / 2;

    this.bottom = this.position.y - this.height / 2;
    this.top = this.position.y + this.height / 2;

    this.front = this.position.z + this.depth / 2;
    this.back = this.position.z - this.depth / 2;

    this.velocity = velocity;
    this.gravity = -0.005;
  }

  updateSides() {
    this.right = this.position.x + this.width / 2;
    this.left = this.position.x - this.width / 2;

    this.bottom = this.position.y - this.height / 2;
    this.top = this.position.y + this.height / 2;

    this.front = this.position.z + this.depth / 2;
    this.back = this.position.z - this.depth / 2;
  }

  update(ground) {
    this.updateSides();
    this.position.x += this.velocity.x;

    let isColliding = this.right >= ground.left && this.left <= ground.right;

    if (!isColliding) {
      console.log('cube fell off the edge');
      this.velocity.y += this.gravity;
      this.position.y += this.velocity.y;

      // Check if the cube is below the visible area
      if (this.position.y < -10) {
        resetCube();

      }
    } else {
      this.applyGravity();
    }
  }

  applyGravity() {

    this.velocity.y += this.gravity;

    // where we hit the ground
    if (this.bottom + this.velocity.y <= ground.top) {
      this.velocity.y *= 0.8;
      this.velocity.y = -this.velocity.y;
    } else this.position.y += this.velocity.y;
  }
}

const cube = new Box({
  width: 1,
  height: 1,
  depth: 1,
  velocity: {
    x: 0,
    y: -0.01,
    z: 0
  }
});

cube.castShadow = true;
scene.add(cube);

const ground = new Box({
  width: 5,
  height: 0.5,
  depth: 10,
  color: '#0000ff',
  position: {
    x: 0,
    y: -2,
    z: 0
  }
});

ground.receiveShadow = true;
scene.add(ground);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.y = 3;
light.position.z = 2;
light.castShadow = true;
scene.add(light);

camera.position.z = 5;

const keys = {
  a: {
    pressed: false
  },
  d: {
    pressed: false
  }
};

window.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'KeyA':
      keys.a.pressed = true;
      break;
    case 'KeyD':
      keys.d.pressed = true;
      break;
  }
});

window.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'KeyA':
      keys.a.pressed = false;
      break;
    case 'KeyD':
      keys.d.pressed = false;
      break;
  }
});

function resetCube() {
  // Reset the cube's position, velocity, and other properties
  cube.position.set(0, 0, 0);
  cube.velocity.set(0, 0, 0);

  // Add the cube back to the scene if it's not already in the scene
  if (cube.parent === null) {
    scene.add(cube);
  }
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);

  // movement code
  cube.velocity.x = 0;
  if (keys.a.pressed) {
    cube.velocity.x = -0.05;
  } else if (keys.d.pressed) {
    cube.velocity.x = 0.05;
  }

  cube.update(ground);
  // cube.position.y += -0.01
  // cube.rotation.x += 0.01
  // cube.rotation.y += 0.01
}
animate();
