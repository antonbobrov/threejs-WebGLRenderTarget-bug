const perspective = 2000;
let object;

const container = document.createElement('div');
container.classList.add('scene');
document.body.appendChild(container);



// base renderer

const camera = new THREE.PerspectiveCamera(getFOV(), getAspectRatio(), 1, 10000);
camera.position.z = perspective;
const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({
    antialias: false,
    alpha: true,
    powerPreference: 'high-performance',
    depth: true,
});
renderer.physicallyCorrectLights = true;
renderer.setPixelRatio(1);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);



// create render target
const renderTarget = new THREE.WebGLRenderTarget(
    window.innerWidth, window.innerHeight,
    {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
    },
);
const renderTargetCamera = new THREE.PerspectiveCamera(getFOV(), getAspectRatio(), 1, 10000);
renderTargetCamera.position.z = perspective;
const renderTargetScene = new THREE.Scene();

const sceneGeometry = new THREE.PlaneBufferGeometry(window.innerWidth, window.innerHeight, 10, 10);
const sceneMaterial = new THREE.MeshBasicMaterial({
    map: renderTarget.texture,
});
const sceneMesh = new THREE.Mesh(sceneGeometry, sceneMaterial);
scene.add(sceneMesh);



// add object

const light = new THREE.SpotLight(0xffffff, 3);
light.distance = 0;
light.penumbra = 1;
light.decay = 0;
light.angle = Math.PI / 2;
light.position.z = 200;
light.position.x = 200;
light.position.y = 200;
renderTargetCamera.add(light);
renderTargetScene.add(renderTargetCamera);

new THREE.OrbitControls(renderTargetCamera, document.body);

function loadModel () {
    object.position.y = 200;
    object.scale.set(4, 4, 4);
    renderTargetScene.add(object);

    object.traverse((child) => {
        if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0xff0000),
                emissive: new THREE.Color(328965),
                roughness: 0.4,
                metalness: 0,
            });
        }
    });
}
const manager = new THREE.LoadingManager(loadModel);
const loader = new THREE.OBJLoader(manager);
loader.load('./waterfall.obj', (obj) => {
    object = obj;
});



// calc
function getFOV () {
    return 180 * (2 * Math.atan(window.innerHeight / 2 / perspective)) / Math.PI;
}
function getAspectRatio () {
    return window.innerWidth / window.innerHeight;
}



// animate the scene

function animate () {
    requestAnimationFrame(animate);
    render();
}
animate();

function render () {
    renderer.setRenderTarget(renderTarget);
    renderer.render(renderTargetScene, renderTargetCamera);
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
}
