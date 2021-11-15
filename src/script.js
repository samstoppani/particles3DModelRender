import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import particlesVertexShader from './shaders/particles/vertex.glsl'
import particlesFragmentShader from './shaders/particles/fragment.glsl'
import randomVertexShader from './shaders/random/vertex.glsl'
import randomFragmentShader from './shaders/random/fragment.glsl'

import Particles  from './Particles'

// Texture loader
const loadingManager = new THREE.LoadingManager()

// Draco loader
const dracoLoader = new DRACOLoader(loadingManager)
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader(loadingManager)
gltfLoader.setDRACOLoader(dracoLoader)

// Canvas
const canvas = document.querySelector('canvas#webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color('#333333')

/**
 * Sizes
 */
 const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 20
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.autoRotate = true
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


// Random Particles
const randomParticlesGeometry = new THREE.BufferGeometry()
const randomParticlesCount = 2000
const positionArray = new Float32Array(randomParticlesCount * 3)
const scaleArray = new Float32Array(randomParticlesCount)

for (let i = 0; i < randomParticlesCount; i++) {
    positionArray[i * 3 + 0] = (Math.random() - 0.5) * 100
    positionArray[i * 3 + 1] = (Math.random() - 0.5) * 100
    positionArray[i * 3 + 2] = (Math.random() - 0.5) * 100

    scaleArray[i] = Math.random()
}

randomParticlesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))
randomParticlesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1))

// Material
const randomParticlesMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uSize: { value: 180 },
        uTime: { value: 0 }
    },
    vertexShader: randomVertexShader,
    fragmentShader: randomFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending, // Performance intensive
    depthWrite: false
})

// Points 
const randomParticles = new THREE.Points(randomParticlesGeometry, randomParticlesMaterial)
randomParticles.position.y = -30
scene.add(randomParticles)

// Objects
let mixer;
let material;
let particles;

gltfLoader.load(
    'abstract.glb',
    (gltf) => {

        // Initiate particles
        material = new THREE.ShaderMaterial({
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true, // Adds the color attribute to vertex.glsl
            vertexShader: particlesVertexShader,
            fragmentShader: particlesFragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uSize: { value: 8 * renderer.getPixelRatio() }
            }
        })

        particles = new Particles(scene, renderer, gltf.scene.children, material);

        // Add animations to the scene
        gltf.animations.forEach(function (animation) {
            scene.animations.push(animation);
        });

        // Play animations
        mixer = new THREE.AnimationMixer(scene);
        const clips = gltf.animations;
        clips.forEach(function (clip) {
            mixer.clipAction(clip).play();
        });

    }
)

// Desktop Interactivity
let isSwiping = false
document.getElementById('webgl').addEventListener('mousemove', () => {
    isSwiping = true
});

document.getElementById('webgl').addEventListener('click', e => {  
    e.preventDefault();
    if (!isSwiping) {
        particles.nextParticles()
    }
    isSwiping = false;
})

// Mobile Interactivity
document.getElementById('webgl').addEventListener('touchstart', () => {
    isSwiping = false;
});
  
document.getElementById('webgl').addEventListener('touchmove', () => {
    isSwiping = true;
});
  
document.getElementById('webgl').addEventListener('touchend', e => {
    e.preventDefault();
    if (!isSwiping) {
        particles.nextParticles()
    }
    isSwiping = false;
});


/**
 * Animate
 */
const clock = new THREE.Clock()

let previousTime;
let elapsedTime;
const tick = () =>
{
    previousTime = elapsedTime;
    elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime;

    // Update animation
    if (mixer) {
        mixer.update(deltaTime);
    }

    // Update material
    if (particles) {     
        particles.material.uniforms.uTime.value = elapsedTime 
    }

    // Update random particles 
    randomParticlesMaterial.uniforms.uTime.value = elapsedTime
    randomParticles.rotation.x = elapsedTime * 0.1

    // Update Orbital Controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()