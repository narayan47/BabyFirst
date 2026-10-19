
import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Float } from "@react-three/drei";
import * as THREE from "three";

function PipModel() {
  const group = useRef();
  const [happy, setHappy] = useState(false);
  const [jump, setJump] = useState(false);

  useFrame((state, delta) => {
    if (!group.current) return;

    // Gentle idle movement.
    group.current.rotation.y += delta * 0.15;

    const targetScale = jump ? 1.12 : 1;
    group.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.12
    );

    group.current.position.y =
      Math.sin(state.clock.elapsedTime * 2) * 0.06;
  });

  function reactToPip() {
    setHappy((previous) => !previous);
    setJump(true);
    window.setTimeout(() => setJump(false), 350);
  }

  return (
    <Float speed={2} rotationIntensity={0.12} floatIntensity={0.3}>
      <group
        ref={group}
        onClick={reactToPip}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        {/* Skull head */}
        <mesh position={[0, 1.15, 0]} castShadow>
          <sphereGeometry args={[0.72, 40, 40]} />
          <meshStandardMaterial
            color="#fff1d7"
            roughness={0.48}
          />
        </mesh>

        {/* Lower jaw */}
        <mesh position={[0, 0.72, 0.12]} castShadow>
          <boxGeometry args={[0.72, 0.34, 0.56]} />
          <meshStandardMaterial color="#fff1d7" roughness={0.5} />
        </mesh>

        {/* Eye sockets */}
        {[-0.28, 0.28].map((x) => (
          <mesh key={x} position={[x, 1.22, 0.615]}>
            <sphereGeometry args={[0.19, 24, 24]} />
            <meshStandardMaterial color="#30274a" />
          </mesh>
        ))}

        {/* Tiny nose */}
        <mesh position={[0, 0.98, 0.68]}>
          <coneGeometry args={[0.075, 0.13, 3]} />
          <meshStandardMaterial color="#30274a" />
        </mesh>

        {/* Teeth */}
        {[-0.2, -0.067, 0.067, 0.2].map((x) => (
          <mesh key={x} position={[x, 0.71, 0.405]}>
            <boxGeometry args={[0.09, 0.14, 0.07]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        ))}

        {/* Tiny body */}
        <mesh position={[0, 0.08, 0]} castShadow>
          <capsuleGeometry args={[0.34, 0.48, 8, 16]} />
          <meshStandardMaterial color="#a9e8d4" roughness={0.6} />
        </mesh>

        {/* Arms */}
        {[-1, 1].map((side) => (
          <mesh
            key={side}
            position={[side * 0.43, 0.15, 0]}
            rotation={[0, 0, side * -0.45]}
            castShadow
          >
            <capsuleGeometry args={[0.105, 0.32, 6, 12]} />
            <meshStandardMaterial color="#fff1d7" />
          </mesh>
        ))}

        {/* Feet */}
        {[-1, 1].map((side) => (
          <mesh
            key={side}
            position={[side * 0.2, -0.29, 0.08]}
            castShadow
          >
            <sphereGeometry args={[0.17, 20, 20]} />
            <meshStandardMaterial color="#fff1d7" />
          </mesh>
        ))}

        {/* Blush */}
        {[-1, 1].map((side) => (
          <mesh
            key={side}
            position={[side * 0.48, 0.99, 0.51]}
          >
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshStandardMaterial
              color={happy ? "#ff6384" : "#f4a4a4"}
              transparent
              opacity={0.85}
            />
          </mesh>
        ))
      }

        {/* Little star on top */}
        <mesh position={[0, 1.91, 0]} rotation={[0, 0, 0.15]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial
            color={happy ? "#ffbd47" : "#ffd968"}
            emissive="#ffbd47"
            emissiveIntensity={0.25}
          />
        </mesh>
      </group>
    </Float>
  );
}

export default function ThreeDream() {
  return (
    <section className="pip-3d-section">
      <div className="pip-3d-heading">
        <span className="pip-3d-kicker">MEET YOUR DREAM FRIEND</span>
        <h2>Say hello to Pip ✨</h2>
        <p>Drag to turn Pip around. Scroll to zoom. Tap Pip for a surprise!</p>
      </div>

      <div className="pip-3d-stage">
        <Canvas
          shadows
          camera={{ position: [0, 0.8, 4.8], fov: 42 }}
          dpr={[1, 2]}
        >
          <color attach="background" args={["#f2eaff"]} />
          <ambientLight intensity={1.5} />
          <directionalLight
            position={[3, 5, 4]}
            intensity={2.2}
            castShadow
          />
          <pointLight position={[-3, 2, 1]} intensity={1.2} color="#ffbfdd" />

          <PipModel />

          <ContactShadows
            position={[0, -0.75, 0]}
            opacity={0.3}
            scale={4}
            blur={2}
          />

          <OrbitControls
            enablePan={false}
            enableDamping
            dampingFactor={0.08}
            minDistance={3}
            maxDistance={7}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={(Math.PI * 2) / 3}
          />
        </Canvas>
      </div>

      <p className="pip-3d-hint">🌙 A tiny skeleton with big dreams.</p>
    </section>
  );
}
