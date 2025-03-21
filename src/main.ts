import * as THREE from 'three';
import GUI from 'lil-gui'; // Import lil-gui
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class App {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private startTime: number;
  private heightMult: number = 1.0;
  private radiusMult: number = 1.0;
  private gui: GUI;
  private particles: THREE.Points;
  private controls: OrbitControls;
  private particleCount = {value: 500};
  private camConfig = {
    fov: 75,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 1000,
  };

  private uniforms = {
    u_time: { value: 0.0 },
    u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    u_speed: { value: 1.0 },
    u_behavior: { value: 0 },
    u_centerOfMass: { value: new THREE.Vector3(0, 0, 0) },
    u_radius_mult: { value: 3.0 },
    u_color: { value: new THREE.Color(0.0, 0.5, 0.1)  },
  };

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x00002f);

    this.camera = new THREE.PerspectiveCamera(
      this.camConfig.fov,
      this.camConfig.aspect,
      this.camConfig.near,
      this.camConfig.far
    );

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });

    if (!this.renderer.capabilities.isWebGL2) {
      console.warn('WebGL 2.0 is not available on this browser.');
    }

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

        // Set up OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true; // Smooth camera movement
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.maxPolarAngle = Math.PI / 2; // Limit vertical rotation
    
    // Recreate particles
    const positions = new Float32Array(this.particleCount.value * 3);
    const lifetimes = new Float32Array(this.particleCount.value);

    for (let i = 0; i < this.particleCount.value; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 0.8;
        const height = Math.random() * 0.8;

        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = height;
        positions[i * 3 + 2] = Math.sin(angle) * radius;
        lifetimes[i] = Math.random();
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute("lifetime", new THREE.BufferAttribute(lifetimes, 1));

    this.material = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: this.uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });

    this.particles = new THREE.Points(this.geometry, this.material);

    this.createParticles();
    
    this.camera.position.z = 1.5;

    this.startTime = Date.now();
    this.onWindowResize();

    this.onWindowResize = this.onWindowResize.bind(this);
    this.animate = this.animate.bind(this);

    window.addEventListener('resize', this.onWindowResize);
    this.gui = new GUI();
    this.guiSetup();

    this.animate();
  }

  private guiSetup() {
    
    this.gui.add(this.uniforms.u_speed, 'value', 0.1, 5.0).name('Speed');
    this.gui.add(this.uniforms.u_centerOfMass.value, 'x', -2, 2).name('Center X');
    this.gui.add(this.uniforms.u_centerOfMass.value, 'y', -2, 2).name('Center Y');
    this.gui.add(this.uniforms.u_centerOfMass.value, 'z', -2, 2).name('Center Z');
    this.gui.add(this.material.uniforms.u_radius_mult, 'value', 1.0, 20.0).name('Radius Mult');
    this.gui.add(this.uniforms.u_behavior, 'value', { Fire: 0, Spores: 1, Asteroids: 2 }).name('Effect Type');
    this.gui.add(this.uniforms.u_color.value, 'r', 0.1, 1.0).name('Red');
    this.gui.add(this.uniforms.u_color.value, 'g', 0.1, 1.0).name('Green');
    this.gui.add(this.uniforms.u_color.value, 'b', 0.1, 1.0).name('Blue');
    this.gui.add(this, 'heightMult', 0.1, 1.0).name('Height').onChange(() => {
      this.createParticles();
  });
    this.gui.add(this, 'radiusMult', 0.1, 1.0).name('Radius').onChange(() => {
      this.createParticles();
  });
    this.gui.add(this.particleCount, 'value', 100, 50000, 100).name("Particle Count").onChange(() => {
      this.createParticles();
  });
  }

  private createParticles() {
    // Remove the existing particle system from the scene if it exists
    if (this.particles) {
        this.scene.remove(this.particles);
        this.geometry.dispose(); // Free up memory
        this.material.dispose();
    }

    // Recreate particles
    const positions = new Float32Array(this.particleCount.value * 3);
    const lifetimes = new Float32Array(this.particleCount.value);

    for (let i = 0; i < this.particleCount.value; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = (Math.random() - Math.random()) * this.radiusMult;
        const height = (Math.random() - Math.random()) * this.heightMult;

        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = height;
        positions[i * 3 + 2] = Math.sin(angle) * radius;
        lifetimes[i] = Math.random();
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute("lifetime", new THREE.BufferAttribute(lifetimes, 1));

    this.material = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: this.uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });

    this.particles = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.particles);
}

  
  private animate(): void {
    requestAnimationFrame(this.animate);
    const elapsedTime = (Date.now() - this.startTime) / 1000;
    this.material.uniforms.u_time.value = elapsedTime * this.uniforms.u_speed.value * 0.5;
    
    this.material.uniforms.u_behavior.value = this.uniforms.u_behavior.value;

    //  Actualizamos el centro de masa cuando estamos en el modo de Asteroides
    if (this.uniforms.u_behavior.value === 2) {
      this.material.uniforms.u_centerOfMass.value.set(
        this.uniforms.u_centerOfMass.value.x, // Centro en X
        this.uniforms.u_centerOfMass.value.y, // Centro en Y
        this.uniforms.u_centerOfMass.value.z  // Centro en Z
      );
      
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }


  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
  }
}

const myApp = new App();
