import React, { useEffect, useState, useRef, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import * as THREE from "three";

const Loader = ({ progress = 0 }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-90 z-10 text-white">
    <div className="relative w-64 h-4 bg-gray-700 rounded-full overflow-hidden mb-4">
      <div 
        className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
    <div className="mt-4 flex space-x-2">
      {[1, 2, 3].map((i) => (
        <div 
          key={i}
          className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  </div>
);

const STLViewer = ({ file }) => {
  const [fileUrl, setFileUrl] = useState(null);
  const [contextLost, setContextLost] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [geometry, setGeometry] = useState(null);
  const canvasRef = useRef();
  const loaderRef = useRef(new STLLoader());

  // Memoize the model loading function
  const loadModel = useCallback((url) => {
    setIsLoading(true);
    setLoadingProgress(0);
    setGeometry(null);

    loaderRef.current.load(
      url,
      (geom) => {
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
        setLoadingProgress(100);
        setIsLoading(false);
      },
      (xhr) => {
        setLoadingProgress((xhr.loaded / xhr.total) * 100);
      },
      (error) => {
        console.error("STL load error:", error);
        setLoadingProgress(100);
        setIsLoading(false);
      }
    );
  }, []);

  // Handle file changes
  useEffect(() => {
    let blobUrl = null;

    const processFile = async () => {
      if (!file) {
        setFileUrl(null);
        setGeometry(null);
        return;
      }

      if (file instanceof File) {
        blobUrl = URL.createObjectURL(file);
        setFileUrl(blobUrl);
        loadModel(blobUrl);
      } else if (typeof file === "string") {
        const url = file.startsWith("http") || file.startsWith("blob") 
          ? file 
          : getAbsoluteUrl(file);
        setFileUrl(url);
        loadModel(url);
      }
    };

    processFile();

    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      // Abort any ongoing loading
      if (loaderRef.current) {
        loaderRef.current.manager.onLoad = () => {};
        loaderRef.current.manager.onProgress = () => {};
        loaderRef.current.manager.onError = () => {};
      }
    };
  }, [file, loadModel]);

  // Handle WebGL context loss
  useEffect(() => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;

    const handleContextLost = (e) => {
      e.preventDefault();
      console.warn("WebGL context lost.");
      setContextLost(true);
    };

    const handleContextRestored = () => {
      console.log("WebGL context restored.");
      setContextLost(false);
      if (fileUrl) loadModel(fileUrl);
    };

    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [fileUrl, loadModel]);

  const handleRetry = () => {
    setContextLost(false);
    if (fileUrl) loadModel(fileUrl);
  };

  return (
    <div className="relative w-full h-[500px] overflow-hidden shadow-lg bg-gray-800">
      {isLoading && <Loader progress={loadingProgress} />}
      
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
        <Canvas
          ref={canvasRef}
          camera={{ position: [0, 0, 3], fov: 50 }}
          gl={{
            preserveDrawingBuffer: true,
            antialias: true,
            powerPreference: "high-performance"
          }}
          frameloop="demand"
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          {geometry && (
            <mesh geometry={geometry}>
              <meshStandardMaterial 
                color="white" 
                metalness={0.5} 
                roughness={0.3}
                onUpdate={(self) => self.needsUpdate = true}
              />
            </mesh>
          )}
          <OrbitControls 
            autoRotate 
            autoRotateSpeed={1.5}
            enableDamping
            dampingFactor={0.05}
          />
        </Canvas>
      )}
    </div>
  );
};

const getAbsoluteUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("blob")) return path;
  return `${window.location.origin}${path.startsWith("/") ? "" : "/"}${path}`;
};

export default STLViewer;