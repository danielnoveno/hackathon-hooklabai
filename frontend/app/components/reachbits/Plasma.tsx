'use client';

import React, { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';

interface PlasmaProps {
  color?: string;
  speed?: number;
  direction?: 'forward' | 'reverse' | 'pingpong';
  scale?: number;
  opacity?: number;
  mouseInteractive?: boolean;
}

const hexToRgb = (hex: string): [number, number, number] => {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Handle shorthand (e.g. F00 -> FF0000)
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }

  const bigint = parseInt(hex, 16);
  if (isNaN(bigint)) return [1, 1, 1]; // Default white if invalid

  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return [r / 255, g / 255, b / 255];
};

const vertex = `#version 300 es
precision highp float;
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

// FIXED SHADER: Variables initialized to 0.0
const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform vec3 uCustomColor;
uniform float uUseCustomColor;
uniform float uSpeed;
uniform float uDirection;
uniform float uScale;
uniform float uOpacity;
uniform vec2 uMouse;
uniform float uMouseInteractive;
out vec4 fragColor;

void mainImage(out vec4 o, vec2 C) {
  vec2 center = iResolution.xy * 0.5;
  // Protect against division by zero if scale is 0
  float safeScale = max(uScale, 0.001); 
  C = (C - center) / safeScale + center;
  
  vec2 mouseOffset = (uMouse - center) * 0.0002;
  C += mouseOffset * length(C - center) * step(0.5, uMouseInteractive);
  
  // PERBAIKAN UTAMA DI SINI: Inisialisasi variabel!
  float i = 0.0;
  float d = 0.0;
  float z = 0.0;
  float T = iTime * uSpeed * uDirection;
  
  vec3 O = vec3(0.0); // Akumulator warna harus 0 dulu
  vec3 p = vec3(0.0);
  vec3 S = vec3(0.0);

  for (vec2 r = iResolution.xy, Q; ++i < 60.0; O += o.w/d*o.xyz) {
    p = z * normalize(vec3(C - 0.5 * r, r.y)); 
    p.z -= 4.0; 
    S = p;
    d = p.y - T;
    
    p.x += 0.4 * (1.0 + p.y) * sin(d + p.x * 0.1) * cos(0.34 * d + p.x * 0.05); 
    Q = p.xz *= mat2(cos(p.y + vec4(0, 11, 33, 0) - T)); 
    z += d = abs(sqrt(length(Q * Q)) - 0.25 * (5.0 + S.y)) / 3.0 + 8e-4; 
    o = 1.0 + sin(S.y + p.z * 0.5 + S.z - length(S - p) + vec4(2, 1, 0, 8));
  }
  
  o.xyz = tanh(O / 1e4);
}

bool finite1(float x){ return !(isnan(x) || isinf(x)); }
vec3 sanitize(vec3 c){
  return vec3(
    finite1(c.r) ? c.r : 0.0,
    finite1(c.g) ? c.g : 0.0,
    finite1(c.b) ? c.b : 0.0
  );
}

void main() {
  vec4 o = vec4(0.0);
  mainImage(o, gl_FragCoord.xy);
  vec3 rgb = sanitize(o.rgb);
  
  float intensity = (rgb.r + rgb.g + rgb.b) / 3.0;
  vec3 customColor = intensity * uCustomColor;
  vec3 finalColor = mix(rgb, customColor, step(0.5, uUseCustomColor));
  
  float alpha = length(rgb) * uOpacity;
  fragColor = vec4(finalColor, alpha);
}`;

export default function Plasma({
  color = '#ffffff',
  speed = 1,
  direction = 'forward',
  scale = 1,
  opacity = 1,
  mouseInteractive = true
}: PlasmaProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const useCustomColor = color ? 1.0 : 0.0;
    const customColorRgb = color ? hexToRgb(color) : [1, 1, 1];
    const directionMultiplier = direction === 'reverse' ? -1.0 : 1.0;

    // Setup Renderer
    const renderer = new Renderer({
      webgl: 2,
      alpha: true,
      antialias: true, // Ubah ke true biar lebih halus
      dpr: Math.min(window.devicePixelRatio || 1, 2)
    });

    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0); // Clear transparent

    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    
    // Clear container first just in case (React Strict Mode safety)
    containerRef.current.innerHTML = ''; 
    containerRef.current.appendChild(canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Float32Array([1, 1]) },
        uCustomColor: { value: new Float32Array(customColorRgb) },
        uUseCustomColor: { value: useCustomColor },
        uSpeed: { value: speed * 0.4 },
        uDirection: { value: directionMultiplier },
        uScale: { value: scale },
        uOpacity: { value: opacity },
        uMouse: { value: new Float32Array([0, 0]) },
        uMouseInteractive: { value: mouseInteractive ? 1.0 : 0.0 }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });

    // Handle Resize
    const setSize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // Ensure dimensions are never 0 to avoid WebGL warnings
      const width = Math.max(rect.width, 1);
      const height = Math.max(rect.height, 1);
      
      renderer.setSize(width, height);
      
      const res = program.uniforms.iResolution.value as Float32Array;
      // Gunakan drawingBuffer (physical pixels) agar tajam di layar Retina/HP
      res[0] = gl.drawingBufferWidth;
      res[1] = gl.drawingBufferHeight;
    };

    const ro = new ResizeObserver(setSize);
    ro.observe(containerRef.current);
    // Trigger initial size immediately
    setSize();

    // Handle Mouse
    const handleMouseMove = (e: MouseEvent) => {
      if (!mouseInteractive || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) * renderer.dpr;
      const y = (rect.height - (e.clientY - rect.top)) * renderer.dpr; // Flip Y for GLSL
      
      const mouseUniform = program.uniforms.uMouse.value as Float32Array;
      mouseUniform[0] = x;
      mouseUniform[1] = y;
    };

    if (mouseInteractive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // Animation Loop
    let rafId = 0;
    const t0 = performance.now();
    
    const loop = (t: number) => {
      rafId = requestAnimationFrame(loop);
      const timeValue = (t - t0) * 0.001;
      (program.uniforms.iTime as any).value = timeValue;
      renderer.render({ scene: mesh });
    };
    rafId = requestAnimationFrame(loop);

    // Cleanup
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      if (mouseInteractive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      // Safety cleanup
      const glLoseContext = gl.getExtension('WEBGL_lose_context');
      if (glLoseContext) glLoseContext.loseContext();
      
      if (containerRef.current && containerRef.current.contains(canvas)) {
        containerRef.current.removeChild(canvas);
      }
    };
  }, [color, speed, direction, scale, opacity, mouseInteractive]);

  return <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-black" />;
}