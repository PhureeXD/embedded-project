import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { PointLight, Group } from "three"

interface LightBulbProps {
  isOn: boolean
}

export default function LightBulb({ isOn }: LightBulbProps) {
  const lightRef = useRef<PointLight>(null)
  const groupRef = useRef<Group>(null)

  useFrame(({ clock }) => {
    if (lightRef.current) {
      lightRef.current.intensity = isOn ? 1 : 0
    }
    if (groupRef.current) {
      groupRef.current.rotation.y =
        Math.sin(clock.getElapsedTime()) * Math.PI * 0.1 // Rotate left and right
      groupRef.current.rotation.x =
        Math.sin(clock.getElapsedTime()) * Math.PI * 0.1 // Rotate up and down
      groupRef.current.rotation.z =
        Math.sin(clock.getElapsedTime()) * Math.PI * 0.1 // Move up and down
    }
  })

  return (
    <group ref={groupRef} castShadow>
      {/* Point Light */}
      <pointLight
        ref={lightRef}
        position={[0, 1, 0]}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Light Bulb Geometry */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color={isOn ? "#ffff00" : "#808080"}
          emissive={isOn ? "#ffff00" : "#000000"}
        />
      </mesh>

      {/* Bulb Base */}
      <mesh position={[0, -0.75, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.5, 32]} />
        <meshStandardMaterial color="#404040" />
      </mesh>

      {/* Shadow Plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.5, 0]}
        receiveShadow
      >
        <planeGeometry args={[5, 5]} />
        <shadowMaterial opacity={0.5} />
      </mesh>
    </group>
  )
}
