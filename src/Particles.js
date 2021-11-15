import * as THREE from 'three';
import { gsap } from 'gsap'

export default class Particles {
	constructor(scene, renderer, meshes, material) {
        this.scene = scene
        this.renderer = renderer
        this.meshes = meshes
        this.meshIndex = 0

        this.material = material

		this.createParticles();
	}

    createParticles() {

        this.meshes.forEach( (mesh, index) => {

            this.geometry = new THREE.BufferGeometry()
            const particleCount = mesh.geometry.attributes.position.count
    
            const colors = new Float32Array(particleCount * 3)
            const randomness = new Float32Array(particleCount * 3)
            const insideColor = new THREE.Color('#30e6ff')
            const outsideColor = new THREE.Color('#1b3984')
    
            for(let i = 0; i < particleCount; i++)
            {
                const i3 = i * 3
    
                // Color
                const mixedColor = insideColor.clone()
                const radius = Math.random() * 0.5
                mixedColor.lerp(outsideColor, radius * 1)
    
                colors[i3    ] = mixedColor.r
                colors[i3 + 1] = mixedColor.g
                colors[i3 + 2] = mixedColor.b
    
                // Randomness
                const randomX = Math.pow(Math.random(), 2) * (Math.random() < 0.5 ? 1 : - 1) * 1 * radius
                const randomY = Math.pow(Math.random(), 2) * (Math.random() < 0.5 ? 1 : - 1) * 1 * radius
                const randomZ = Math.pow(Math.random(), 2) * (Math.random() < 0.5 ? 1 : - 1) * 1 * radius
    
                randomness[i3    ] = randomX
                randomness[i3 + 1] = randomY
                randomness[i3 + 2] = randomZ
            }
    
            this.geometry.setAttribute('position', new THREE.BufferAttribute(mesh.geometry.attributes.position.array, 3))
            this.geometry.setAttribute('aRandomness', new THREE.BufferAttribute(randomness, 3))
            this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    
            const object = new THREE.Points( this.geometry, this.material )
    
            object.name = mesh.name
    
            object.position.x = mesh.position.x
            object.position.y = mesh.position.y
            object.position.z = mesh.position.z
    
            object.rotation.x = mesh.rotation.x
            object.rotation.y = mesh.rotation.y
            object.rotation.z = mesh.rotation.z
    
            object.scale.x = mesh.scale.x
            object.scale.y = mesh.scale.y
            object.scale.z = mesh.scale.z
    
            object.scale.set(0, 0, 0)

            if (index == 0) {
                gsap.to(object.scale, { x: 1, y: 1, z: 1, duration: 1 })
            }
            
            this.scene.add( object )
        })


    }

    nextParticles() {

        // Grab previous object and reduce scale to 0
        const previousObject = this.scene.getObjectByName( this.meshes[this.meshIndex].name );
        gsap.to(previousObject.scale, { x: 0, y: 0, z: 0, duration: 1, ease: 'power2.out'})
        gsap.to(previousObject.rotation, { x: Math.PI, y: Math.PI, z: Math.PI, duration: 1, ease: 'power2.out'})

        // Grab next object and increase scale to 1
        if (this.meshIndex != this.meshes.length - 1) {
            this.meshIndex++
        }
        else {
            this.meshIndex = 0
        }
        const nextObject = this.scene.getObjectByName( this.meshes[this.meshIndex].name );
        gsap.to(nextObject.scale, { x: 1, y: 1, z: 1, duration: 1, ease: 'power2.out'})
        gsap.to(nextObject.rotation, { x: Math.PI, y: Math.PI, z: Math.PI, duration: 1, ease: 'power2.out'})

        // Update HTML
        document.getElementById('modelIndex').innerHTML = this.meshIndex + 1
    }
}