'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

type ZoomLevel = 'globe' | 'particles' | 'threads';

// Mock threads data
const THREADS_DATA = [
  {
    id: 1,
    username: 'gabeeinhorn',
    avatar: '👤',
    time: '1d',
    content: "Let's have a week, thank you God for the opportunity.",
    comments: 3,
    likes: 98,
    verified: true
  },
  {
    id: 2,
    username: 'techstartup',
    avatar: '🚀',
    time: '2h',
    content: "Just launched our new AI product. The future is here! 🎉",
    comments: 12,
    likes: 234,
    verified: true
  },
  {
    id: 3,
    username: 'creativemind',
    avatar: '🎨',
    time: '5h',
    content: "Sometimes the best ideas come when you least expect them. Keep creating!",
    comments: 8,
    likes: 156,
    verified: false
  },
  {
    id: 4,
    username: 'businesspro',
    avatar: '💼',
    time: '8h',
    content: "Grateful for another successful quarter. Hard work pays off! 💪",
    comments: 15,
    likes: 342,
    verified: true
  },
  {
    id: 5,
    username: 'traveladdict',
    avatar: '✈️',
    time: '12h',
    content: "Just booked my next adventure. Life is too short to stay in one place.",
    comments: 6,
    likes: 189,
    verified: false
  },
  {
    id: 6,
    username: 'fitnessguru',
    avatar: '💪',
    time: '1d',
    content: "Consistency is key. Another morning, another workout done ✅",
    comments: 9,
    likes: 267,
    verified: true
  },
];

interface DomeGlobeProps {
  onZoomLevelChange?: (level: ZoomLevel) => void;
}

export default function DomeGlobe({ onZoomLevelChange }: DomeGlobeProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationIdRef = useRef<number | null>(null);

  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('globe');
  const [showThreads, setShowThreads] = useState(false);

  // Refs for objects
  const globeGroupRef = useRef<THREE.Group | null>(null);

  // Interaction state
  const isDraggingRef = useRef(false);
  const previousMouseRef = useRef({ x: 0, y: 0 });
  const rotationVelocityRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0, y: 0 });
  const currentRotationRef = useRef({ x: 0, y: 0 });

  // Zoom state - START AT 3
  const targetZoomRef = useRef(3);
  const currentZoomRef = useRef(3);

  const particlesPositionsRef = useRef<number[]>([]);

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;

    // Setup Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      50,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 3;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    rendererRef.current = renderer;

    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // Create globe group
    const globeGroup = new THREE.Group();
    globeGroupRef.current = globeGroup;
    scene.add(globeGroup);

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesPositions: number[] = [];
    const particlesColors: number[] = [];

    const particleCount = 5000;
    const phi = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < particleCount; i++) {
      const y = 1 - (i / (particleCount - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;

      particlesPositions.push(x * 1.01, y * 1.01, z * 1.01);

      const intensity = 0.5 + Math.random() * 0.5;
      particlesColors.push(0.2 * intensity, 0.5 * intensity, 1.0 * intensity);
    }

    particlesPositionsRef.current = [...particlesPositions];

    particlesGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(particlesPositions, 3)
    );
    particlesGeometry.setAttribute(
      'color',
      new THREE.Float32BufferAttribute(particlesColors, 3)
    );

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.015,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    globeGroup.add(particles);

    // Grid lines
    const gridGroup = new THREE.Group();

    for (let i = 0; i < 12; i++) {
      const theta = (i / 12) * Math.PI;
      const radius = Math.sin(theta);
      const y = Math.cos(theta);

      const circleGeometry = new THREE.RingGeometry(radius * 0.99, radius * 1.01, 64);
      const circleMaterial = new THREE.MeshBasicMaterial({
        color: 0x3366ff,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide
      });
      const circle = new THREE.Mesh(circleGeometry, circleMaterial);
      circle.rotation.x = Math.PI / 2;
      circle.position.y = y;
      gridGroup.add(circle);
    }

    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const curve = new THREE.EllipseCurve(0, 0, 1, 1, 0, Math.PI * 2, false, 0);
      const points = curve.getPoints(50);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0x3366ff,
        transparent: true,
        opacity: 0.15
      });
      const line = new THREE.Line(geometry, material);
      line.rotation.y = angle;
      gridGroup.add(line);
    }

    globeGroup.add(gridGroup);

    // Glow
    const glowGeometry = new THREE.SphereGeometry(1.15, 32, 32);
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        c: { value: 0.3 },
        p: { value: 4.5 }
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float c;
        uniform float p;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(c - dot(vNormal, vec3(0.0, 0.0, 1.0)), p);
          gl_FragColor = vec4(0.2, 0.4, 1.0, 1.0) * intensity;
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    globeGroup.add(glowMesh);

    // Lights
    scene.add(new THREE.AmbientLight(0x404040, 2));
    const pointLight = new THREE.PointLight(0x3366ff, 1, 100);
    pointLight.position.set(2, 2, 2);
    scene.add(pointLight);

    // Animation
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      currentZoomRef.current += (targetZoomRef.current - currentZoomRef.current) * 0.05;
      camera.position.z = currentZoomRef.current;

      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.05;
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.05;

      if (!isDraggingRef.current) {
        targetRotationRef.current.y += 0.001;
        rotationVelocityRef.current.x *= 0.95;
        rotationVelocityRef.current.y *= 0.95;
        targetRotationRef.current.x += rotationVelocityRef.current.x;
        targetRotationRef.current.y += rotationVelocityRef.current.y;
      }

      if (globeGroupRef.current) {
        globeGroupRef.current.rotation.x = currentRotationRef.current.x;
        globeGroupRef.current.rotation.y = currentRotationRef.current.y;
      }

      // Animate particles
      const positions = particlesGeometry.attributes.position.array as Float32Array;
      const time = Date.now() * 0.001;

      for (let i = 0; i < positions.length; i += 3) {
        const x = particlesPositionsRef.current[i];
        const y = particlesPositionsRef.current[i + 1];
        const z = particlesPositionsRef.current[i + 2];

        let dispersion = 0;
        if (currentZoomRef.current < 2.5) {
          dispersion = (2.5 - currentZoomRef.current) * 2;
        }

        const wave = Math.sin(time + (i / 3) * 0.1) * 0.02;
        positions[i] = x * (1 + dispersion) + wave;
        positions[i + 1] = y * (1 + dispersion) + wave;
        positions[i + 2] = z * (1 + dispersion) + wave;
      }

      particlesGeometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // WHEEL EVENT - DIRECTLY ON MOUNT
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const delta = e.deltaY * 0.003;
      const newZoom = Math.max(0.5, Math.min(5, targetZoomRef.current + delta));
      targetZoomRef.current = newZoom;

      // Update level
      let newLevel: ZoomLevel;
      if (newZoom < 1.5) {
        newLevel = 'threads';
        setShowThreads(true);
      } else if (newZoom < 2.5) {
        newLevel = 'particles';
        setShowThreads(false);
      } else {
        newLevel = 'globe';
        setShowThreads(false);
      }

      if (newLevel !== zoomLevel) {
        setZoomLevel(newLevel);
        onZoomLevelChange?.(newLevel);
      }
    };

    // POINTER EVENTS
    const handlePointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      previousMouseRef.current = { x: e.clientX, y: e.clientY };
      rotationVelocityRef.current = { x: 0, y: 0 };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;

      const deltaX = e.clientX - previousMouseRef.current.x;
      const deltaY = e.clientY - previousMouseRef.current.y;

      targetRotationRef.current.y += deltaX * 0.005;
      targetRotationRef.current.x += deltaY * 0.005;

      rotationVelocityRef.current.x = deltaY * 0.0005;
      rotationVelocityRef.current.y = deltaX * 0.0005;

      previousMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    const handleResize = () => {
      if (!currentMount || !camera) return;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };

    // ADD LISTENERS TO MOUNT
    currentMount.addEventListener('wheel', handleWheel, { passive: false });
    currentMount.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('resize', handleResize);

    currentMount.style.cursor = 'grab';

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }

      currentMount.removeEventListener('wheel', handleWheel);
      currentMount.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('resize', handleResize);

      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }

      renderer.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      glowMaterial.dispose();
      glowGeometry.dispose();
    };
  }, [zoomLevel, onZoomLevelChange]);

  return (
    <div className="absolute inset-0">
      {/* THREE.js Mount */}
      <div
        ref={mountRef}
        className="absolute inset-0 w-full h-full"
        style={{
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      />

      {/* Threads Overlay - SCROLLBAR HIDDEN */}
      {showThreads && (
        <div className="absolute inset-0 flex items-start justify-center pt-24 pb-20 pointer-events-none">
          <div
            className="w-full max-w-[380px] px-4 space-y-3 max-h-[65vh] pointer-events-auto overflow-y-auto custom-scrollbar"
          >
            {THREADS_DATA.map((thread, index) => (
              <div
                key={thread.id}
                className="bg-black/80 backdrop-blur-lg rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-lg">
                      {thread.avatar}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-white text-sm font-semibold">
                        {thread.username}
                      </span>
                      {thread.verified && (
                        <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/50 text-xs">{thread.time}</span>
                    <button className="text-white/50 hover:text-white">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <p className="text-white text-sm mb-3 leading-relaxed">
                  {thread.content}
                </p>

                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1.5 text-white/60 hover:text-white transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-xs">{thread.comments}</span>
                  </button>

                  <button className="flex items-center gap-1.5 text-white/60 hover:text-red-500 transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-xs">{thread.likes}</span>
                  </button>

                  <button className="flex items-center gap-1.5 text-white/60 hover:text-white transition ml-auto">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Zoom Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-50">
        <div className="bg-black/70 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
          <p className="text-white/90 text-xs font-medium">
            {zoomLevel === 'globe' && '🌍 Scroll to zoom in'}
            {zoomLevel === 'particles' && '✨ Keep scrolling'}
            {zoomLevel === 'threads' && '📱 Scroll to zoom out'}
          </p>
        </div>
      </div>

      <style jsx>{`
        /* Custom Scrollbar - HIDDEN */
        .custom-scrollbar {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}