"use client";

import React, { useRef, useEffect } from "react";
import { useGLTF, Center } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Hook3D({ onLoaded, ...props }: any) {
    const { scene } = useGLTF("/3d_model.glb");
    const meshRef = useRef<THREE.Group>(null);

    useEffect(() => {
        if (onLoaded) {
            onLoaded();
        }
    }, [onLoaded]);

    useFrame((state, delta) => {
        if (meshRef.current) {
            // Rotation: 360 degrees every 15 seconds (matches original CSS animation)
            meshRef.current.rotation.y += (Math.PI * 2 / 15) * delta;
        }
    });

    return (
        <Center>
            <primitive
                ref={meshRef}
                object={scene}
                {...props}
            />
        </Center>
    );
}

useGLTF.preload("/3d_model.glb");
