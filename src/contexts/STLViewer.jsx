import React, { useEffect, useState, Suspense } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader"; // More specific import path
import * as THREE from "three";

// Loader component
const Loader = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10 text-white text-lg">
    Loading 3D model...
  </div>
);

const STLViewer = ({ file }) => {
  const [fileUrl, setFileUrl] = useState(null);

  useEffect(() => {
    let blobUrl = null;

    if (!file) {
      setFileUrl(null);
      return;
    }

    if (file instanceof File) {
      blobUrl = URL.createObjectURL(file);
      setFileUrl(blobUrl);
    } else if (typeof file === "string") {
      if (file.startsWith("http") || file.startsWith("blob")) {
        setFileUrl(file);
      } else {
        setFileUrl(getAbsoluteUrl(file));
      }
    }

    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [file]);

  if (!file) return null;

  return (
    <div className="relative w-full h-[500px] overflow-hidden shadow-lg bg-gray-800">
      <Suspense fallback={<Loader />}>
        <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          {fileUrl && <STLModel file={fileUrl} />}
          <OrbitControls autoRotate autoRotateSpeed={1.5} />
        </Canvas>
      </Suspense>
    </div>
  );
};

const STLModel = ({ file }) => {
  const geometry = useLoader(STLLoader, file);

  // Safe bounding box computation
  if (!geometry.boundingBox) {
    geometry.computeBoundingBox();
  }

  const bbox = geometry.boundingBox;
  const center = new THREE.Vector3();
  bbox.getCenter(center);
  geometry.translate(-center.x, -center.y, -center.z);

  const size = new THREE.Vector3();
  bbox.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  const scaleFactor = 1.5 / maxDim;

  return (
    <mesh geometry={geometry} scale={[scaleFactor, scaleFactor, scaleFactor]}>
      <meshStandardMaterial color="white" metalness={0.5} roughness={0.3} />
    </mesh>
  );
};

const getAbsoluteUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("blob")) return path;
  return `${window.location.origin}${path.startsWith("/") ? "" : "/"}${path}`;
};

export default STLViewer;
