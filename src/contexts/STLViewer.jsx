import React, { useEffect, useState, Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import * as THREE from "three";

// Loader UI
const Loader = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10 text-white text-lg">
    Loading 3D model...
  </div>
);

// STL Viewer with retry logic
const STLViewer = ({ file }) => {
  const [fileUrl, setFileUrl] = useState(null);
  const [contextLost, setContextLost] = useState(false);
  const canvasRef = useRef();

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

  const handleRetry = () => {
    setContextLost(false); // Reset the context lost flag
  };

  return (
    <div className="relative w-full h-[500px] overflow-hidden shadow-lg bg-gray-800">
      {contextLost ? (
        <div className="flex flex-col items-center justify-center h-full text-white">
          <p className="mb-4">WebGL context lost. Please retry.</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Retry
          </button>
        </div>
      ) : (
        <Suspense fallback={<Loader />}>
          <Canvas
            ref={canvasRef}
            camera={{ position: [0, 0, 3], fov: 50 }}
            gl={{ preserveDrawingBuffer: true, antialias: true }}
            onCreated={({ gl }) => {
              const canvas = gl.domElement;
              canvas.addEventListener("webglcontextlost", (e) => {
                e.preventDefault();
                console.warn("WebGL context lost.");
                setContextLost(true);
              });
            }}
          >
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            {fileUrl && <STLModel fileUrl={fileUrl} />}
            <OrbitControls autoRotate autoRotateSpeed={1.5} />
          </Canvas>
        </Suspense>
      )}
    </div>
  );
};

// STL model loading with bounding box centering and scaling
const STLModel = ({ fileUrl }) => {
  const [geometry, setGeometry] = useState(null);

  useEffect(() => {
    const loader = new STLLoader();
    let isMounted = true;

    loader.load(
      fileUrl,
      (geom) => {
        if (!isMounted) return;

        geom.computeBoundingBox();
        const bbox = geom.boundingBox;
        const center = new THREE.Vector3();
        bbox.getCenter(center);
        geom.translate(-center.x, -center.y, -center.z);

        const size = new THREE.Vector3();
        bbox.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.5 / maxDim;

        geom.scale(scale, scale, scale);
        setGeometry(geom);
      },
      undefined,
      (error) => {
        console.error("STL load error:", error);
      }
    );

    return () => {
      isMounted = false;
    };
  }, [fileUrl]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="white" metalness={0.5} roughness={0.3} />
    </mesh>
  );
};

// Get full path from relative
const getAbsoluteUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("blob")) return path;
  return `${window.location.origin}${path.startsWith("/") ? "" : "/"}${path}`;
};

export default STLViewer;
