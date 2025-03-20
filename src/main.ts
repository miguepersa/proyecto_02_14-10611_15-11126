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
  private gui: GUI;
  private fireParticles: THREE.Points;
  private controls: OrbitControls;
  private camConfig = {
    fov: 75,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 1000,
  };

  private uniforms = {
    u_time: { value: 0.0 },
    u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    u_speed: { value: 1.0 }, // Example uniform to control speed
    u_intensity: { value: 1.0 }, // Example uniform to control intensity
    u_behavior: { value: 0 }
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


    const particleCount = 500;
    const positions = new Float32Array(particleCount * 3);
    const lifetimes = new Float32Array(particleCount); // To control particle lifespan

    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2; // Random angle
        const radius = (Math.random()) * 0.8; // Spread particles within a small radius
        const height = Math.random() * 0.8; // Simulate rising fire
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = height;
        positions[i * 3 + 2] = Math.sin(angle) * radius;
        lifetimes[i] = Math.random() - Math.random(); // Random lifetime
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));

    this.material = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
            u_time: { value: 0.0 },
            u_color: { value: new THREE.Color(0.0, 0.5, 0.1)  },
            u_behavior: { value: 1 }, // 0 = Fire, 1 = Spores

        },
        transparent: true,
        alphaTest: 0.5, 
        depthWrite: false,
        blending: THREE.AdditiveBlending, // Glowing effect
    });

    this.fireParticles = new THREE.Points(this.geometry, this.material);
    this.fireParticles.position.set(0, 0, 0);
    this.scene.add(this.fireParticles);
    


    
    this.camera.position.z = 1.5;

    this.startTime = Date.now();
    this.onWindowResize();

    this.onWindowResize = this.onWindowResize.bind(this);
    this.animate = this.animate.bind(this);

    window.addEventListener('resize', this.onWindowResize);

    this.gui = new GUI();
    this.gui.add(this.uniforms.u_speed, 'value', 0.1, 5.0).name('Speed');
    this.gui.add(this.uniforms.u_intensity, 'value', 0.1, 5.0).name('Intensity');
    this.gui.add(this.material.uniforms.u_behavior, 'value', { Fire: 0, Spores: 1 }).name('Effect Type');

    this.animate();
  }
  
  private animate(): void {
    requestAnimationFrame(this.animate);
    const elapsedTime = (Date.now() - this.startTime) / 1000;
    this.material.uniforms.u_time.value = elapsedTime * this.uniforms.u_speed.value * 0.5;

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
