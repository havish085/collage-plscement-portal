import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeDScoreMeterProps {
  score: number;
}

export const ThreeDScoreMeter: React.FC<ThreeDScoreMeterProps> = ({ score }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 220;
    const height = container.clientHeight || 220;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 7;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Dynamic color selection based on score
    let mainHex = 0x10b981; // emerald
    let lightHex = 0x34d399;
    if (score < 60) {
      mainHex = 0xf43f5e; // rose
      lightHex = 0xfb7185;
    } else if (score < 80) {
      mainHex = 0xf59e0b; // amber
      lightHex = 0xfcd34d;
    }

    // 4. Main Outer 3D Progress Ring
    const tubeRadius = 0.25;
    const ringRadius = 2.2;
    const arcAngle = (score / 100) * Math.PI * 2;

    const ringGeometry = new THREE.TorusGeometry(ringRadius, tubeRadius, 30, 100, arcAngle);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: mainHex,
      emissive: mainHex,
      emissiveIntensity: 0.7,
      roughness: 0.2,
      metalness: 0.8,
    });
    const progressRing = new THREE.Mesh(ringGeometry, ringMaterial);
    progressRing.rotation.z = Math.PI / 2;
    scene.add(progressRing);

    // Background track ring (faint wireframe)
    const trackGeometry = new THREE.TorusGeometry(ringRadius, tubeRadius * 0.6, 16, 60);
    const trackMaterial = new THREE.MeshBasicMaterial({
      color: 0x475569,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const trackRing = new THREE.Mesh(trackGeometry, trackMaterial);
    scene.add(trackRing);

    // 5. Core Pulsing 3D Gem
    const coreGeometry = new THREE.OctahedronGeometry(1.0, 2);
    const coreMaterial = new THREE.MeshPhongMaterial({
      color: lightHex,
      emissive: mainHex,
      emissiveIntensity: 0.6,
      shininess: 90,
      transparent: true,
      opacity: 0.85,
      wireframe: true
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(coreMesh);

    // 6. Orbiting Particles
    const particleCount = 60;
    const particlesGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const r = ringRadius + (Math.random() - 0.5) * 0.8;
      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = Math.sin(angle) * r;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMat = new THREE.PointsMaterial({
      color: lightHex,
      size: 0.08,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleSystem);

    // 7. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(lightHex, 3, 20);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // 8. Mouse Interactivity
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    container.addEventListener('mousemove', handleMouseMove);

    // 9. Animation Loop
    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth rotate ring & core
      progressRing.rotation.y = Math.sin(elapsedTime * 0.5) * 0.3 + mouseX * 0.6;
      progressRing.rotation.x = Math.cos(elapsedTime * 0.5) * 0.3 + mouseY * 0.6;

      trackRing.rotation.copy(progressRing.rotation);

      coreMesh.rotation.x = elapsedTime * 0.8;
      coreMesh.rotation.y = elapsedTime * 0.6;
      const s = 1 + Math.sin(elapsedTime * 3) * 0.06;
      coreMesh.scale.set(s, s, s);

      particleSystem.rotation.z = elapsedTime * 0.3;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      ringGeometry.dispose();
      ringMaterial.dispose();
      trackGeometry.dispose();
      trackMaterial.dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
      renderer.dispose();
    };
  }, [score]);

  return (
    <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center shrink-0">
      {/* ThreeJS WebGL Canvas */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />
      
      {/* 3D Score Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none select-none">
        <span className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md">
          {score}%
        </span>
        <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-200/90 mt-0.5">
          Match Index
        </span>
      </div>
    </div>
  );
};
