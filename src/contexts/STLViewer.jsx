// components/STLViewer.js
import React, { useEffect, useState } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/Addons.js";
import * as THREE from "three";

const STLViewer = ({ file }) => {
  const [fileUrl, setFileUrl] = useState(null);

  useEffect(() => {
    if (!file) {
      setFileUrl(null);
      return;
    }

    // Case 1: File is a File object (from upload)
    if (file instanceof File) {
      const blobUrl = URL.createObjectURL(file);
      setFileUrl(blobUrl);
      return () => URL.revokeObjectURL(blobUrl); // Cleanup
    }

    // Case 2: File is a URL string (from API)
    if (typeof file === 'string') {
      // If it's already a full URL, use it directly
      if (file.startsWith('http') || file.startsWith('blob')) {
        setFileUrl(file);
      } else {
        // If it's a relative path, convert to absolute URL
        setFileUrl(getAbsoluteUrl(file));
      }
      return;
    }
  }, [file]);

  if (!file) return null;

  return (
    <div className="w-full h-[500px] overflow-hidden shadow-lg bg-gray-800">
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        {fileUrl && <STLModel file={fileUrl} />}
        <OrbitControls autoRotate autoRotateSpeed={1.5} />
      </Canvas>
    </div>
  );
};

const STLModel = ({ file }) => {
  const geometry = useLoader(STLLoader, file);

  geometry.computeBoundingBox();
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

// Helper function to convert relative paths to absolute URLs
const getAbsoluteUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("blob")) return path;
  // Adjust this base URL as needed for your environment
  return `${window.location.origin}${path.startsWith('/') ? '' : '/'}${path}`;
};

export default STLViewer;