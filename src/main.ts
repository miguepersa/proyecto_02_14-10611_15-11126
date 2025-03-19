import * as THREE from 'three';
import GUI from 'lil-gui'; // Import lil-gui
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';

class App {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private geometry: THREE.PlaneGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private startTime: number;
  private gui: GUI;

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
  };

  constructor() {
    this.scene = new THREE.Scene();

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

    this.geometry = new THREE.PlaneGeometry(2, 2);
    this.material = new THREE.RawShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      glslVersion: THREE.GLSL3,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
    this.camera.position.z = 1.5;

    this.startTime = Date.now();
    this.onWindowResize();

    this.onWindowResize = this.onWindowResize.bind(this);
    this.animate = this.animate.bind(this);

    window.addEventListener('resize', this.onWindowResize);

    // Setup GUI
    this.setupGUI();

    this.animate();
  }

  private setupGUI(): void {
    this.gui = new GUI();
    this.gui.add(this.uniforms.u_speed, 'value', 0.1, 5.0).name('Speed');
    this.gui.add(this.uniforms.u_intensity, 'value', 0.1, 5.0).name('Intensity');
  }

  private animate(): void {
    requestAnimationFrame(this.animate);
    const elapsedTime = (Date.now() - this.startTime) / 1000;
    this.uniforms.u_time.value = elapsedTime * this.uniforms.u_speed.value;
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
