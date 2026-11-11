/**
 * MoveMyCar UAE - Interactive 3D Vehicle Showcase (Three.js)
 * Real-time 3D luxury car model with showroom lighting, physical shaders, and color customizer
 */

class ThreeCarViewer {
  constructor(canvasContainerId = 'threeCarCanvas') {
    this.container = document.getElementById(canvasContainerId);
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.carGroup = null;
    this.bodyMaterial = null;
    this.wheels = [];
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.autoRotate = true;
    this.currentColor = '#E5293E'; // Carmine Red from reference

    this.init();
  }

  init() {
    if (!window.THREE) return;

    const width = this.container.clientWidth || 580;
    const height = this.container.clientHeight || 420;

    // 1. Scene setup
    this.scene = new THREE.Scene();

    // 2. Camera setup
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    this.camera.position.set(4.8, 2.0, 5.2);
    this.camera.lookAt(0, 0.4, 0);

    // 3. Renderer with antialiasing and shadow support
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting setup (Studio Showroom)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    mainKeyLight.position.set(5, 8, 5);
    mainKeyLight.castShadow = true;
    mainKeyLight.shadow.mapSize.width = 1024;
    mainKeyLight.shadow.mapSize.height = 1024;
    mainKeyLight.shadow.camera.near = 0.5;
    mainKeyLight.shadow.camera.far = 25;
    this.scene.add(mainKeyLight);

    const rimLight = new THREE.DirectionalLight(0xff5577, 1.2);
    rimLight.position.set(-6, 4, -4);
    this.scene.add(rimLight);

    const frontFill = new THREE.DirectionalLight(0xffffff, 0.7);
    frontFill.position.set(0, 3, 6);
    this.scene.add(frontFill);

    // 5. Build 3D Car Model
    this.buildCar();

    // 6. Ground Shadow Contact Plane
    this.buildGroundShadow();

    // 7. Interactive Mouse Events
    this.bindMouseEvents();

    // 8. Responsive Resize
    window.addEventListener('resize', () => this.onWindowResize());

    // 9. Animation Loop
    this.animate();
  }

  buildCar() {
    this.carGroup = new THREE.Group();

    // High-end Metallic Car Paint Material
    this.bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(this.currentColor),
      metalness: 0.85,
      roughness: 0.18,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      reflectivity: 0.9
    });

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.88,
      transparent: true,
      opacity: 0.82
    });

    const blackTrimMaterial = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.45,
      metalness: 0.3
    });

    const chromeMaterial = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      metalness: 0.95,
      roughness: 0.08
    });

    const tireMaterial = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.85,
      metalness: 0.1
    });

    const brakeCaliperMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.3,
      metalness: 0.6
    });

    // --- Lower Chassis ---
    const lowerChassisGeo = new THREE.BoxGeometry(3.6, 0.45, 1.7);
    const lowerChassis = new THREE.Mesh(lowerChassisGeo, this.bodyMaterial);
    lowerChassis.position.y = 0.42;
    lowerChassis.castShadow = true;
    lowerChassis.receiveShadow = true;
    this.carGroup.add(lowerChassis);

    // --- Sleek Aerodynamic Hood / Front Nose ---
    const hoodGeo = new THREE.BoxGeometry(1.2, 0.28, 1.62);
    const hood = new THREE.Mesh(hoodGeo, this.bodyMaterial);
    hood.position.set(1.4, 0.52, 0);
    hood.rotation.z = -0.08;
    hood.castShadow = true;
    this.carGroup.add(hood);

    // --- Cabin / Roof Streamline ---
    const cabinGeo = new THREE.BoxGeometry(1.9, 0.58, 1.4);
    const cabin = new THREE.Mesh(cabinGeo, glassMaterial);
    cabin.position.set(-0.15, 0.88, 0);
    cabin.castShadow = true;
    this.carGroup.add(cabin);

    // Roof Top Shell
    const roofGeo = new THREE.BoxGeometry(1.6, 0.08, 1.34);
    const roof = new THREE.Mesh(roofGeo, this.bodyMaterial);
    roof.position.set(-0.15, 1.18, 0);
    roof.castShadow = true;
    this.carGroup.add(roof);

    // --- Rear Trunk / Spoiler Lip ---
    const rearGeo = new THREE.BoxGeometry(0.8, 0.35, 1.62);
    const rear = new THREE.Mesh(rearGeo, this.bodyMaterial);
    rear.position.set(-1.5, 0.56, 0);
    rear.rotation.z = 0.06;
    rear.castShadow = true;
    this.carGroup.add(rear);

    // Rear Spoiler
    const spoilerGeo = new THREE.BoxGeometry(0.2, 0.06, 1.65);
    const spoiler = new THREE.Mesh(spoilerGeo, blackTrimMaterial);
    spoiler.position.set(-1.85, 0.78, 0);
    this.carGroup.add(spoiler);

    // --- Front Grille & Carbon Splitter ---
    const grilleGeo = new THREE.BoxGeometry(0.12, 0.22, 1.2);
    const grille = new THREE.Mesh(grilleGeo, blackTrimMaterial);
    grille.position.set(2.0, 0.35, 0);
    this.carGroup.add(grille);

    const splitterGeo = new THREE.BoxGeometry(0.25, 0.04, 1.68);
    const splitter = new THREE.Mesh(splitterGeo, blackTrimMaterial);
    splitter.position.set(1.95, 0.22, 0);
    this.carGroup.add(splitter);

    // --- LED Headlights (Crisp Ice Blue White) ---
    const headlightGeo = new THREE.BoxGeometry(0.18, 0.08, 0.32);
    const headlightMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      emissive: 0x60a5fa,
      emissiveIntensity: 0.8
    });

    const leftHeadlight = new THREE.Mesh(headlightGeo, headlightMat);
    leftHeadlight.position.set(1.92, 0.52, 0.62);
    this.carGroup.add(leftHeadlight);

    const rightHeadlight = new THREE.Mesh(headlightGeo, headlightMat);
    rightHeadlight.position.set(1.92, 0.52, -0.62);
    this.carGroup.add(rightHeadlight);

    // --- Tail Light Bar (Ruby Red) ---
    const tailBarGeo = new THREE.BoxGeometry(0.08, 0.06, 1.5);
    const tailBarMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xdc2626,
      emissiveIntensity: 0.9
    });
    const tailBar = new THREE.Mesh(tailBarGeo, tailBarMat);
    tailBar.position.set(-1.9, 0.62, 0);
    this.carGroup.add(tailBar);

    // --- Wheels (4x Detailed Alloy Rims + Calipers) ---
    const wheelPositions = [
      [1.15, 0.32, 0.88],   // Front Left
      [1.15, 0.32, -0.88],  // Front Right
      [-1.15, 0.32, 0.88],  // Rear Left
      [-1.15, 0.32, -0.88]  // Rear Right
    ];

    const tireGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.22, 24);
    const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.24, 16);
    const caliperGeo = new THREE.BoxGeometry(0.1, 0.12, 0.08);

    wheelPositions.forEach((pos, idx) => {
      const wheelGroup = new THREE.Group();

      const tire = new THREE.Mesh(tireGeo, tireMaterial);
      tire.rotation.x = Math.PI / 2;
      tire.castShadow = true;
      wheelGroup.add(tire);

      const rim = new THREE.Mesh(rimGeo, chromeMaterial);
      rim.rotation.x = Math.PI / 2;
      wheelGroup.add(rim);

      const caliper = new THREE.Mesh(caliperGeo, brakeCaliperMat);
      caliper.position.set(0.08, 0.1, (idx % 2 === 0 ? 0.06 : -0.06));
      wheelGroup.add(caliper);

      wheelGroup.position.set(pos[0], pos[1], pos[2]);
      this.carGroup.add(wheelGroup);
      this.wheels.push(wheelGroup);
    });

    this.carGroup.position.y = 0.05;
    this.scene.add(this.carGroup);
  }

  buildGroundShadow() {
    // Soft radial ground shadow
    const shadowGeo = new THREE.PlaneGeometry(5.2, 3.2);
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 60);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.38)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.18)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const shadowTexture = new THREE.CanvasTexture(canvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false
    });

    const groundShadow = new THREE.Mesh(shadowGeo, shadowMat);
    groundShadow.rotation.x = -Math.PI / 2;
    groundShadow.position.y = 0.01;
    this.scene.add(groundShadow);
  }

  changeCarColor(hexColor) {
    if (this.bodyMaterial) {
      this.bodyMaterial.color.set(hexColor);
      this.currentColor = hexColor;
    }
  }

  bindMouseEvents() {
    const el = this.renderer.domElement;

    el.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.autoRotate = false;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging || !this.carGroup) return;

      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      this.carGroup.rotation.y += deltaX * 0.012;
      this.camera.position.y = Math.max(1.0, Math.min(3.5, this.camera.position.y + deltaY * 0.008));
      this.camera.lookAt(0, 0.4, 0);

      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
      clearTimeout(this._idleTimer);
      this._idleTimer = setTimeout(() => {
        this.autoRotate = true;
      }, 3500);
    });

    // Touch events for mobile
    el.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.autoRotate = false;
        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    el.addEventListener('touchmove', (e) => {
      if (!this.isDragging || e.touches.length !== 1 || !this.carGroup) return;
      const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
      this.carGroup.rotation.y += deltaX * 0.014;
      this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });

    el.addEventListener('touchend', () => {
      this.isDragging = false;
      this.autoRotate = true;
    });
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight || 420;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (this.autoRotate && this.carGroup) {
      this.carGroup.rotation.y += 0.006;
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

window.ThreeCarViewer = ThreeCarViewer;
