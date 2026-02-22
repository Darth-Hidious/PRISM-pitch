import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function CrystalLattice() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
        camera.position.set(0, 0, 6);

        // Lattice parameters
        const gridSize = 4;
        const spacing = 1.0;
        const atomRadius = 0.08;

        // Instanced atoms
        const atomGeo = new THREE.IcosahedronGeometry(atomRadius, 2);
        const atomMat = new THREE.MeshStandardMaterial({
            color: 0x00d4ff,
            metalness: 0.9,
            roughness: 0.15,
            emissive: 0x002244,
            emissiveIntensity: 0.3,
        });
        const atomCount = Math.pow(gridSize, 3);
        const instancedAtoms = new THREE.InstancedMesh(atomGeo, atomMat, atomCount);

        const dummy = new THREE.Object3D();
        let idx = 0;
        const half = (gridSize - 1) * spacing / 2;
        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                for (let z = 0; z < gridSize; z++) {
                    dummy.position.set(
                        x * spacing - half,
                        y * spacing - half,
                        z * spacing - half
                    );
                    dummy.updateMatrix();
                    instancedAtoms.setMatrixAt(idx++, dummy.matrix);
                }
            }
        }
        scene.add(instancedAtoms);

        // Bond lines
        const bondPositions: number[] = [];
        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                for (let z = 0; z < gridSize; z++) {
                    const px = x * spacing - half;
                    const py = y * spacing - half;
                    const pz = z * spacing - half;
                    if (x < gridSize - 1) bondPositions.push(px, py, pz, px + spacing, py, pz);
                    if (y < gridSize - 1) bondPositions.push(px, py, pz, px, py + spacing, pz);
                    if (z < gridSize - 1) bondPositions.push(px, py, pz, px, py, pz + spacing);
                }
            }
        }

        const bondGeo = new THREE.BufferGeometry();
        bondGeo.setAttribute('position', new THREE.Float32BufferAttribute(bondPositions, 3));
        const bondMat = new THREE.LineBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.15 });
        scene.add(new THREE.LineSegments(bondGeo, bondMat));

        // Lighting
        const ambLight = new THREE.AmbientLight(0x112244, 0.8);
        scene.add(ambLight);
        const dirLight = new THREE.DirectionalLight(0x00d4ff, 1.2);
        dirLight.position.set(3, 4, 5);
        scene.add(dirLight);
        const pointLight = new THREE.PointLight(0xffb800, 0.6, 20);
        pointLight.position.set(-3, -2, 4);
        scene.add(pointLight);

        // Mouse tracking for parallax
        const mouse = { x: 0, y: 0 };
        const onMouseMove = (e: MouseEvent) => {
            mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
            mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
        };
        window.addEventListener('mousemove', onMouseMove);

        const group = new THREE.Group();
        group.add(instancedAtoms);
        scene.add(group);

        const clock = new THREE.Clock();
        let animId: number;

        const animate = () => {
            animId = requestAnimationFrame(animate);
            const t = clock.getElapsedTime();

            // Slow rotation + mouse parallax
            group.rotation.x = t * 0.08 + mouse.y * 0.15;
            group.rotation.y = t * 0.12 + mouse.x * 0.15;

            renderer.render(scene, camera);
        };
        animate();

        const onResize = () => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', onResize);

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', onResize);
            window.removeEventListener('mousemove', onMouseMove);
            renderer.dispose();
            atomGeo.dispose();
            atomMat.dispose();
            bondGeo.dispose();
            bondMat.dispose();
            container.removeChild(renderer.domElement);
        };
    }, []);

    return <div ref={containerRef} className="absolute inset-0 w-full h-full" />;
}
