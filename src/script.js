import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Galaxy
 */
const parameters = {};
parameters.count = 10000;
parameters.size = 0.01;
parameters.radius = 5;
parameters.branches = 3;
parameters.spin = 1;

let geometry = null;
let material = null;
let galaxy = null;

const generateGalaxy = () => {

    /**
     * Destroy previous galaxy
     */
    if(galaxy !== null)
    {
        geometry.dispose();
        material.dispose();
        scene.remove(galaxy);
    }

    geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(parameters.count * 3);

    for (let i=0; i<parameters.count; i++) {
        const i3 = i*3;

        // Position the particles on a straight line
        const radius = Math.random() * parameters.radius;

        /*
            We multiply the radius by the spin
            The further away from the center si the particle, the more spin we want
        */
        const spinAngle = radius * parameters.spin;

        /*
            Calculate branch's angle
            To get the branch's number
            To get the percentage of the angle (e.g. 0, 0.33, 0.66), we divide by the number of branches
            To get the PI value, me multiply by PI and by 2
        */
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;

        // log the 20st values
        if(i < 20) {
            console.log('i: ' + i % parameters.branches, ' branchAngle: ' + branchAngle);
        }

        // We add the spinAngle to the branchAngle
        positions[i3] = Math.cos(branchAngle + spinAngle) * radius;
        positions[i3 + 1] = 0;
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius;
    }

    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
    );

    /**
     * Material
     */
    material = new THREE.PointsMaterial({
        size: parameters.size,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    galaxy = new THREE.Points(geometry, material);
    scene.add(galaxy)
}

generateGalaxy();

gui.add(parameters, 'count', 100, 100000, 100).onFinishChange(generateGalaxy);
gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy);
gui.add(parameters, 'radius').min(0.1).max(15).step(0.1).onFinishChange(generateGalaxy);
gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy);
gui.add(parameters, 'spin').min(-5).max(5).step(0.05).onFinishChange(generateGalaxy);

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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()