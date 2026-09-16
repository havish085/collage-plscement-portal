import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { ShieldCheck, TrendingUp, Cpu } from 'lucide-react';

export const ThreeDAnimation: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();
    
    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 15;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 4. Create Main 3D Object: Glowing Wireframe Torus Knot
    const knotGeometry = new THREE.TorusKnotGeometry(2.8, 0.8, 120, 24);
    
    // Wireframe material with neon indigo glow
    const knotMaterial = new THREE.MeshStandardMaterial({
      color: 0x818cf8,
      wireframe: true,
      emissive: 0x4f46e5,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
    });
    
    const torusKnot = new THREE.Mesh(knotGeometry, knotMaterial);
    scene.add(torusKnot);

    // 5. Create Inner Core Sphere
    const coreGeometry = new THREE.IcosahedronGeometry(1.6, 2);
    const coreMaterial = new THREE.MeshPhongMaterial({
      color: 0xc084fc,
      emissive: 0x7c3aed,
      emissiveIntensity: 0.8,
      shininess: 100,
      transparent: true,
      opacity: 0.85,
    });
    const coreSphere = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(coreSphere);

    // 6. Particle Field (Placement Nodes Constellation)
    const particlesCount = 180;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xa78bfa,
      size: 0.15,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleSystem);

    // 7. Ambient & Point Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x818cf8, 2.5, 50);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xf472b6, 2, 50);
    pointLight2.position.set(-10, -10, -10);
    scene.add(pointLight2);

    // 8. Mouse & Touch interaction (3D perspective tilt)
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handlePointerMove = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      const x = clientX - rect.left - rect.width / 2;
      const y = clientY - rect.top - rect.height / 2;
      targetX = (x / rect.width) * 2;
      targetY = (y / rect.height) * 2;
    };

    const handleMouseMove = (event: MouseEvent) => {
      handlePointerMove(event.clientX, event.clientY);
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        handlePointerMove(event.touches[0].clientX, event.touches[0].clientY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // 9. Resize listener
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 10. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse damping
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      // Rotate torus knot
      torusKnot.rotation.x = elapsedTime * 0.25 + mouseY * 0.5;
      torusKnot.rotation.y = elapsedTime * 0.35 + mouseX * 0.5;

      // Pulse core sphere
      coreSphere.rotation.x = -elapsedTime * 0.4;
      coreSphere.rotation.y = -elapsedTime * 0.3;
      const scale = 1 + Math.sin(elapsedTime * 2) * 0.08;
      coreSphere.scale.set(scale, scale, scale);

      // Rotate particles slow spiral
      particleSystem.rotation.y = elapsedTime * 0.05;
      particleSystem.rotation.x = Math.sin(elapsedTime * 0.03) * 0.2;

      // Move camera slight float
      camera.position.x = mouseX * 1.5;
      camera.position.y = -mouseY * 1.5;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      knotGeometry.dispose();
      knotMaterial.dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-auto">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Floating 3D Depth Cards & Badges Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between p-4 sm:p-8 pointer-events-none">
        
        {/* Floating Card 1: Top Right */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="self-end px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-white/10 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-2xl flex items-center gap-2.5 sm:gap-3 text-white pointer-events-auto hover:bg-white/20 transition-all"
        >
          <span className="p-1.5 sm:p-2 rounded-xl bg-indigo-500/30 text-indigo-300">
            <Cpu size={16} />
          </span>
          <div>
            <div className="text-[11px] sm:text-xs font-bold">Vertex AI Matcher</div>
            <div className="text-[9px] sm:text-[10px] text-indigo-200">Real-time Resume Parsing</div>
          </div>
        </motion.div>

        {/* Floating Card 2: Center Left */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="self-start px-3 py-2 sm:px-4 sm:py-3 rounded-2xl bg-white/10 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-2xl flex items-center gap-2.5 sm:gap-3.5 text-white pointer-events-auto hover:bg-white/20 transition-all"
        >
          <span className="p-1.5 sm:p-2 rounded-xl bg-emerald-500/30 text-emerald-300">
            <TrendingUp size={18} />
          </span>
          <div>
            <div className="text-[11px] sm:text-xs font-bold text-emerald-300">95% Placement Rate</div>
            <div className="text-[9px] sm:text-[10px] text-slate-300">Highest Package 32 LPA</div>
          </div>
        </motion.div>

        {/* Floating Card 3: Bottom Right */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: [0, -6, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="self-end px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-white/10 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-2xl flex items-center gap-2 sm:gap-2.5 text-white pointer-events-auto hover:bg-white/20 transition-all"
        >
          <span className="p-1.5 sm:p-2 rounded-xl bg-violet-500/30 text-violet-300">
            <ShieldCheck size={16} />
          </span>
          <div>
            <div className="text-[11px] sm:text-xs font-bold">Automated Eligibility</div>
            <div className="text-[9px] sm:text-[10px] text-indigo-200">Role-Based Verification</div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};
