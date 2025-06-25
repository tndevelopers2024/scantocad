import React, { useEffect, useState, useRef, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import * as THREE from "three";

const Loader = ({ progress = 0 }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-90 z-10 text-white">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
    <p className="mt-4 text-sm">{Math.round(progress)}%</p>
  </div>
);

const STLViewer = ({ file }) => {
  const [fileUrl, setFileUrl] = useState(null);
  const [contextLost, setContextLost] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState(null);
  const canvasRef = useRef();

  const getLoaderByExtension = (ext) => {
    switch (ext.toLowerCase()) {
      case ".stl":
        return new STLLoader();
      case ".ply":
        return new PLYLoader();
      case ".obj":
        return new OBJLoader();
      default:
        return null;
    }
  };

  const loadModel = useCallback((url, extension) => {
    setIsLoading(true);
    setLoadingProgress(0);
    setModel(null);

    const loader = getLoaderByExtension(extension);
    if (!loader) {
      console.error("Unsupported file format:", extension);
      setIsLoading(false);
      return;
    }

    loader.load(
      url,
      (loaded) => {
        let mesh;

        if (loaded instanceof THREE.BufferGeometry) {
          loaded.computeBoundingBox();
          const bbox = loaded.boundingBox;
          const center = new THREE.Vector3();
          bbox.getCenter(center);
          loaded.translate(-center.x, -center.y, -center.z);

          const size = new THREE.Vector3();
          bbox.getSize(size);
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 1.5 / maxDim;
          loaded.scale(scale, scale, scale);

          mesh = (
            <mesh geometry={loaded}>
              <meshStandardMaterial color="white" metalness={0.5} roughness={0.3} />
            </mesh>
          );
        } else if (loaded instanceof THREE.Group) {
          mesh = <primitive object={loaded} />;
        }

        setModel(mesh);
        setLoadingProgress(100);
        setIsLoading(false);
      },
      (xhr) => {
        setLoadingProgress((xhr.loaded / xhr.total) * 100);
      },
      (error) => {
        console.error(`${extension} load error:`, error);
        setLoadingProgress(100);
        setIsLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    let blobUrl = null;

    const processFile = async () => {
      if (!file) {
        setFileUrl(null);
        setModel(null);
        return;
      }

      let fileUrlToLoad;
      let ext;

      if (file instanceof File) {
        blobUrl = URL.createObjectURL(file);
        fileUrlToLoad = blobUrl;
        ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      } else if (typeof file === "string") {
        fileUrlToLoad = file.startsWith("http") || file.startsWith("blob")
          ? file
          : getAbsoluteUrl(file);
        ext = fileUrlToLoad.slice(fileUrlToLoad.lastIndexOf(".")).toLowerCase();
      }

      setFileUrl(fileUrlToLoad);
      loadModel(fileUrlToLoad, ext);
    };

    processFile();

    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [file, loadModel]);

  useEffect(() => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;

    const handleContextLost = (e) => {
      e.preventDefault();
      console.warn("WebGL context lost.");
      setContextLost(true);
    };

    const handleContextRestored = () => {
      console.log("WebGL context restored.");
      setContextLost(false);
      if (fileUrl) {
        const ext = fileUrl.slice(fileUrl.lastIndexOf(".")).toLowerCase();
        loadModel(fileUrl, ext);
      }
    };

    canvas.addEventListener("webglcontextlost", handleContextLost);
    canvas.addEventListener("webglcontextrestored", handleContextRestored);

    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored);
    };
  }, [fileUrl, loadModel]);

  const handleRetry = () => {
    setContextLost(false);
    if (fileUrl) {
      const ext = fileUrl.slice(fileUrl.lastIndexOf(".")).toLowerCase();
      loadModel(fileUrl, ext);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden shadow-lg bg-gray-800">
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
            antialias: true,
            powerPreference: "high-performance"
          }}
          frameloop="always"
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          {model}
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
