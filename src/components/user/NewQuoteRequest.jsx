import React, { useState, useEffect } from "react";
import { requestQuote } from "../../api";
import CreditHours from "./CreditHours";
import STLViewer from "../../contexts/STLViewer";
import { useNavigate } from "react-router-dom";
import Loader from "../../contexts/Loader";
import {
  FiUploadCloud,
  FiFileText,
  FiCheckCircle,
  FiTrash2,
  FiCreditCard,
  FiDownload,
  FiUser,
  FiX,
  FiArrowRight,
  FiArrowLeft,
  FiMaximize,
  FiMinimize,
} from "react-icons/fi";
import Notification from "../../contexts/Notification";
import { motion, AnimatePresence } from "framer-motion";

// Constants for configuration data
const STEPS = [
  { label: "Quote Requested", icon: <FiUploadCloud /> },
  { label: "Receive Quotation", icon: <FiFileText /> },
  { label: "Accept or Reject Quote", icon: <FiCheckCircle /> },
  { label: "Add credit hrs or upload PO", icon: <FiCreditCard /> },
  { label: "Work in Progress", icon: <FiUser /> },
  { label: "Receive Files", icon: <FiDownload /> },
];

const SOFTWARE_OPTIONS = {
  "": { name: "Select software", versions: [] },
  solidworks: {
    name: "SolidWorks - .sldprt",
    versions: [
      "2026",
      "2025",
      "2024",
      "2023",
      "2022",
      "2021",
      "2020",
      "2019",
      "2018",
      "2017",
      "2016",
      "2015",
      "2014",
      "2013",
      "2012",
      "2011",
    ],
  },
  creo: {
    name: "Creo- .prt",
    versions: ["12.0", "11.0", "10.0", "9.0", "8.0", "7.0", "6.0", "5.0"],
  },
  inventor: {
    name: "Inventor - .lam,lpt",
    versions: ["2025", "2024", "2023", "2022", "2021", "2020", "2019"],
  },
  nx: {
    name: "Siemens NX - .prt",
    versions: ["NX 10", "NX 11", "NX 12", "HIGHER VERSIONS"],
  },
  catia: { name: "CATIA - .catpart", versions: ["V5 ", "HIGHER VERSIONS"] },
};

const ALLOWED_INFO_FILE_EXTENSIONS = [
  "xls",
  "pdf",
  "ppt",
  "jpeg",
  "jpg",
  "png",
  "tif",
  "mp",
];

// Sub-components
const InfoIcon = ({ infoText }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block ml-1">
      <button
        type="button"
        className="text-gray-400 hover:text-gray-500 focus:outline-none"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {showTooltip && (
        <div className="absolute z-10 w-64 p-2 mt-2 text-xs text-gray-700 bg-white border border-gray-200 rounded-md shadow-lg">
          {infoText}
        </div>
      )}
    </div>
  );
};

const UploadPopup = ({
  onFileChange,
  onContinue,
  error,
  step,
  selectedFiles,
  onReviewComplete,
  onAddMoreFiles,
  currentFileIndex,
  onNavigateFile,
  onToggleFullScreen,
  onRemoveFile,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const event = {
        target: {
          files: files
        }
      };
      onFileChange(event);
    }
  };

  if (step === 0) {
    return (
      <div
        style={{
          background: "url(/img/banner/upload.png)",
          backgroundColor: "#fff",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
        className="fixed inset-0 bg-white m-0 bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <div className="bg-white shadow rounded-lg overflow-hidden w-full max-w-md">
          <div className="p-12 text-center">
            <h3 className="text-3xl font-semibold text-gray-800 mb-4">
              Upload Files
            </h3>
            <p className="text-gray-600 mb-6">
              Documents uploaded here will be stored in drive
            </p>

            <label
              htmlFor="initial-files-upload"
              className={`flex flex-col items-center justify-center h-48 border-2 border-dashed ${
                error ? "border-red-500" : isDragging ? "border-blue-500 bg-blue-50" : "border-blue-300"
              } rounded-lg cursor-pointer hover:bg-blue-50 transition mb-4`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <FiUploadCloud className="text-4xl text-blue-400 mb-3" />
              <span className="text-lg text-blue-500 font-medium">
                {isDragging ? "Drop files here" : "Click to Upload or drag and drop"}
              </span>
              <span className="text-sm text-gray-500 mt-1">
                Supported format: .stl .ply .obj
              </span>
              <input
                id="initial-files-upload"
                type="file"
                multiple
                accept=".stl,.ply,.obj"
                className="hidden"
                onChange={onFileChange}
              />
            </label>
            {error && (
              <p className="mt-1 text-sm text-red-600 text-center">{error}</p>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={onContinue}
                disabled={selectedFiles.length === 0}
                className={`px-6 py-2 rounded-md font-medium ${
                  selectedFiles.length === 0
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Continue <FiArrowRight className="inline ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div
        style={{
          background: "url(/img/banner/upload.png)",
          backgroundColor: "#fff",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
        className="fixed inset-0 overflow-y-scroll bg-white px-26 py-20 bg-opacity-50 flex gap-8 items-center justify-center z-50 m-0"
      >
        <div className="bg-white shadow rounded-lg overflow-hidden w-[50%]">
          <div className="p-8">
          
<div className="flex mb-6 justify-center">
  <label
    htmlFor="initial-files-upload"
    className={`cursor-pointer px-6 py-2 text-center grid place-items-center gap-3 border-dashed border-2 ${
      isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
    } bg-[#F5EFFD] rounded-md font-medium text-gray-700 hover:bg-gray-50`}
    onDragEnter={handleDragEnter}
    onDragLeave={handleDragLeave}
    onDragOver={handleDragOver}
    onDrop={handleDrop}
  >
    <img className="w-8" src="/img/icon/upload.png" alt="" />
    {isDragging ? "Drop files here" : "Add More Files"}
    <input
      id="initial-files-upload"
      type="file"
      multiple
      accept=".stl,.ply,.obj"
      className="hidden"
      onChange={onFileChange}
    />
  </label>
</div>

            <p className="text-md inline border-b-[1px] font-medium text-gray-700">
              {selectedFiles.length} Files
            </p>
            <div className="max-h-96 flex gap-5 overflow-y-auto mt-2">
              <ul className="w-full space-y-3">
                {selectedFiles.map((file, index) => (
                  <li
                    key={file.name + index} // Better key using file name
                    onClick={() => onNavigateFile(index)}
                    className={`p-3 rounded-lg cursor-pointer 
                    ${
                      currentFileIndex === index
                        ? "border-2 border-[#5D01F2] bg-[#F3F3F3]"
                        : "bg-[#fff]"
                    } 
                    hover:bg-gray-100`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">
                          {index + 1}. {file.name}{" "}
                          {/* Show number before filename */}
                        </p>
                        <p className="text-xs text-gray-500">
                          {Math.round(file.size / 1024 / 1024)} MB
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateFile(index);
                          }}
                          className="text-[#155DFC] hover:text-blue-700"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveFile(index);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="w-[50%] h-full inline-grid gap-5 place-items-end ">
          <FileViewer
            files={selectedFiles}
            currentIndex={currentFileIndex}
            onNavigate={onNavigateFile}
            onToggleFullScreen={onToggleFullScreen}
            fullScreen={false}
            firstFile="true"
          />
          <button
            onClick={onReviewComplete}
            disabled={selectedFiles.length === 0} // Disable if no files
            className={`px-6 py-2 rounded-md mb-6 font-medium text-white hover:bg-blue-700
            ${
              selectedFiles.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600"
            }`}
          >
            Continue to Form <FiArrowRight className="inline ml-1" />
          </button>
        </div>
      </div>
    );
  }

  return null;
};

// Update the FileViewer component
const FileViewer = ({
  files,
  currentIndex,
  onNavigate,
  onToggleFullScreen,
  fullScreen,
  firstFile,
}) => {
  if (files.length === 0) return null;

  const handleNavigation = (direction, e) => {
    e.preventDefault();
    e.stopPropagation();
    onNavigate(direction);
  };

  const handleFullScreenToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFullScreen();
  };

  return (
    <div
      className={`border ${
        fullScreen ? "w-full" : "w-full bg-white"
      } border-gray-200 rounded-lg p-4`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Model View</h3>
        <div className="flex space-x-2">
          {files.length > 1 && (
            <>
              <button
                type="button" // Important: Add type="button"
                onClick={(e) => handleNavigation("prev", e)}
                className="p-1 text-gray-600 hover:text-gray-800"
              >
                <FiArrowLeft />
              </button>
              <button
                type="button" // Important: Add type="button"
                onClick={(e) => handleNavigation("next", e)}
                className="p-1 text-gray-600 hover:text-gray-800"
              >
                <FiArrowRight />
              </button>
            </>
          )}
          <button
            type="button" // Important: Add type="button"
            onClick={handleFullScreenToggle}
            className="p-1 text-gray-600 hover:text-gray-800"
          >
            {fullScreen ? <FiMinimize /> : <FiMaximize />}
          </button>
        </div>
      </div>
      <div
        className={`${
          fullScreen ? "h-[80vh]" : firstFile ? "h-[350px]" : "h-64"
        } bg-gray-100 rounded overflow-hidden border border-gray-300`}
      >
        <STLViewer file={files[currentIndex]} />
      </div>
      <div className="mt-2 text-sm text-gray-700 truncate">
        {files[currentIndex].name}
      </div>
    </div>
  );
};

// Update the FullScreenViewer component
const FullScreenViewer = ({
  files,
  currentIndex,
  onNavigate,
  onClose,
  onRemoveFile,
}) => {
  if (!files.length) return null;

  const handleNavigation = (direction, e) => {
    e.preventDefault();
    e.stopPropagation();
    onNavigate(direction);
  };

  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center p-4 z-50">
      <div className="w-full h-full flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 bg-gray-900 text-white">
          <h4 className="text-lg font-semibold">
            {files[currentIndex].name} ({currentIndex + 1} of {files.length})
          </h4>
          <div className="flex space-x-4 items-center">
            {files.length > 1 && (
              <div className="flex space-x-2">
                <button
                  type="button" // Important: Add type="button"
                  onClick={(e) => handleNavigation("prev", e)}
                  className="p-2 bg-gray-700 rounded hover:bg-gray-600"
                >
                  <FiArrowLeft />
                </button>
                <button
                  type="button" // Important: Add type="button"
                  onClick={(e) => handleNavigation("next", e)}
                  className="p-2 bg-gray-700 rounded hover:bg-gray-600"
                >
                  <FiArrowRight />
                </button>
              </div>
            )}
            <button
              type="button" // Important: Add type="button"
              onClick={handleClose}
              className="p-2 bg-gray-700 rounded hover:bg-gray-600"
            >
              <FiMinimize />
            </button>
          </div>
        </div>
        <div className="flex-1 bg-black">
          <STLViewer file={files[currentIndex]} />
        </div>
      </div>
    </div>
  );
};
const StepsTimeline = () => (
  <div className="bg-white rounded-2xl shadow-lg p-6">
    <h3 className="text-xl font-semibold text-gray-800 mb-6">
      Steps to Receive Your CAD File
    </h3>
    <div className="relative">
      <div
        className="absolute inset-0 top-[-20px] flex items-center"
        aria-hidden="true"
      >
        <div className="w-full border-t-2 border-dashed border-blue-200" />
      </div>

      <div className="relative flex justify-between space-x-4">
        {STEPS.map(({ label, icon }, idx) => (
          <div
            key={idx}
            className="flex time-lines flex-col items-center text-sm text-gray-700"
          >
            <div className="bg-white p-3 first-line rounded-full shadow-md text-blue-600 text-xl">
              {icon}
            </div>
            <span className="mt-2 text-center">{label}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ProgressLoader = ({ progress, message }) => {
  return (
    <div className="fixed inset-0 bg-white/80 bg-opacity-30 m-0 flex flex-col items-center justify-center z-50">
      <div className="flex flex-col items-center justify-center">
        {/* Spinner */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mb-4"></div>
      </div>

      {/* Progress percentage */}
      <div className="text-center text-sm text-gray-500">
        {progress}% complete
      </div>
      <p className="mt-4 w-[500px] text-center text-blue-800 text-2xl font-semibold">
        {message}
      </p>
    </div>
  );
};

const NewQuoteRequest = () => {
  // Form state
  const [formData, setFormData] = useState({
    projectName: "",
    description: "",
    resolution: "",
    deadline: "",
  });
 const [isDragging, setIsDragging] = useState(false);
  const [technicalInfo, setTechnicalInfo] = useState({
    designIntent: false,
    hybridModelling: false,
    scansToNURBS: false,
    asBuildModelling: false,
  });

  const [deliverables, setDeliverables] = useState({
    liveTransferFormat: "",
    cadNeutralFiles: false,
    caddraftfiles: false,
  });

  const [selectedSoftware, setSelectedSoftware] = useState("");
  const [selectedVersion, setSelectedVersion] = useState("");

  // File state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [infoFiles, setInfoFiles] = useState([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  const onNavigateFile = (index) => {
    setCurrentFileIndex(index);
  };

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fullScreenViewer, setFullScreenViewer] = useState(false);
  const [uploadStep, setUploadStep] = useState(0);
  const [showUploadPopup, setShowUploadPopup] = useState(false); // Changed to false initially
  const [progress, setProgress] = useState(0);
  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    type: "success",
    message: "",
  });

  // Error state
  const [errors, setErrors] = useState({
    projectName: "",
    description: "",
    technicalInfo: "",
    liveTransferFormat: "",
    files: "",
    infoFiles: "",
  });

  const navigate = useNavigate();

   // Add these handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setShowUploadPopup(true);
      // You might want to handle the files directly here or pass them to the upload popup
      const event = {
        target: {
          files: files
        }
      };
      handleFileChange(event);
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      projectName: "",
      description: "",
      technicalInfo: "",
      liveTransferFormat: "",
      files: "",
      infoFiles: "",
    };

    // Project name validation
    if (!formData.projectName.trim()) {
      newErrors.projectName = "Project name is required";
      isValid = false;
    } else if (formData.projectName.length > 100) {
      newErrors.projectName = "Project name must be less than 100 characters";
      isValid = false;
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
      isValid = false;
    } else if (formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
      isValid = false;
    }

    // Technical info validation
    if (!Object.values(technicalInfo).some((val) => val)) {
      newErrors.technicalInfo =
        "At least one technical information option must be selected";
      isValid = false;
    }

    // Design intent validation
    if (technicalInfo.designIntent && (!selectedSoftware || !selectedVersion)) {
      newErrors.liveTransferFormat =
        "Both software and version must be selected";
      isValid = false;
    }

    // Files validation
    if (selectedFiles.length === 0) {
      newErrors.files = "At least one file is required";
      isValid = false;
    } else {
      for (const file of selectedFiles) {
        if (file.size > 1024 * 1024 * 1024) {
          newErrors.files = `File ${file.name} exceeds 1GB size limit`;
          isValid = false;
          break;
        }
        const ext = file.name.split(".").pop().toLowerCase();
        if (!["stl", "ply", "obj"].includes(ext)) {
          newErrors.files = `File ${file.name} has invalid extension. Allowed: .stl, .ply, .obj`;
          isValid = false;
          break;
        }
      }
    }

    // Info files validation
    if (infoFiles.length > 0) {
      for (const file of infoFiles) {
        const ext = file.name.split(".").pop().toLowerCase();

        if (!ALLOWED_INFO_FILE_EXTENSIONS.includes(ext)) {
          newErrors.infoFiles = `File ${
            file.name
          } has invalid extension. Allowed: ${ALLOWED_INFO_FILE_EXTENSIONS.join(
            ", "
          )}`;
          isValid = false;
          break;
        }

        if (file.size > 50 * 1024 * 1024) {
          newErrors.infoFiles = `File ${file.name} exceeds 50MB size limit`;
          isValid = false;
          break;
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const uniqueNewFiles = newFiles.filter(
      (newFile) =>
        !selectedFiles.some(
          (existingFile) =>
            existingFile.name === newFile.name &&
            existingFile.size === newFile.size
        )
    );

    if (uniqueNewFiles.length > 0) {
      setSelectedFiles((prevFiles) => [...prevFiles, ...uniqueNewFiles]);
      setErrors((prev) => ({ ...prev, files: "" }));

      if (uploadStep === 0) {
        setUploadStep(1);
      }
    } else {
      showTempNotification("All selected files were already added", "info");
    }
  };

  const handleInfoFilesChange = (e) => {
    const files = Array.from(e.target.files);
    setInfoFiles(files);

    if (files.length > 0) {
      setErrors((prev) => ({ ...prev, infoFiles: "" }));
    }
  };

  const removeFile = (index) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);

    if (currentFileIndex >= newFiles.length) {
      setCurrentFileIndex(Math.max(0, newFiles.length - 1));
    }
  };

  const removeInfoFile = (index) => {
    const newFiles = [...infoFiles];
    newFiles.splice(index, 1);
    setInfoFiles(newFiles);
  };

  const showTempNotification = (message, type = "success") => {
    setNotification({
      show: true,
      type,
      message,
    });

    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showTempNotification("Please fix the errors in the form", "error");
      return;
    }

    setIsSubmitting(true);
    let progress = 0;

    // Update progress every 500ms to simulate progress
    const progressInterval = setInterval(() => {
      progress = Math.min(progress + 5, 90); // Stop at 90% to wait for actual submission
      setProgress(progress);
    }, 500);

    const formDataToSend = new FormData();
    formDataToSend.append("projectName", formData.projectName);
    formDataToSend.append("description", formData.description);

    if (formData.resolution)
      formDataToSend.append("resolution", formData.resolution);
    if (formData.deadline) formDataToSend.append("deadline", formData.deadline);

    const technicalInfoString = Object.entries(technicalInfo)
      .filter(([_, value]) => value)
      .map(([key]) => key)
      .join(", ");

    // Create deliverables string
    let deliverablesString = "";
    if (technicalInfo.designIntent) {
      deliverablesString = `Software: ${selectedSoftware}, Version: ${selectedVersion}, `;
    }
    deliverablesString += `CAD Neutral Files: ${
      deliverables.cadNeutralFiles ? "Yes" : "No"
    }, 2D Drafting: ${deliverables.caddraftfiles ? "Yes" : "No"}`;

    formDataToSend.append("technicalInfo", technicalInfoString);
    formDataToSend.append("deliverables", deliverablesString);

    selectedFiles.forEach((file) => {
      formDataToSend.append("originalFiles", file);
    });

    infoFiles.forEach((file) => {
      formDataToSend.append("infoFiles", file);
    });

    try {
      await requestQuote(formDataToSend);

      // Complete the progress bar
      setProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 500)); // Wait a bit for user to see 100%

      showTempNotification("Quote request submitted successfully!");
      setTimeout(() => {
        navigate("/my-quotations");
      }, 4000);
    } catch (err) {
      console.error(err);
      showTempNotification(
        "Failed to submit quote request. Please try again.",
        "error"
      );
    } finally {
      clearInterval(progressInterval);
      setIsSubmitting(false);
    }
  };

  const handleUploadContinue = () => {
    if (selectedFiles.length > 0) {
      setUploadStep(1);
    } else {
      setErrors((prev) => ({
        ...prev,
        files: "Please upload at least one STL file",
      }));
    }
  };

  const handleReviewComplete = () => {
    setShowUploadPopup(false);
    setUploadStep(2);
  };

  const handleAddMoreFiles = () => {
    setUploadStep(0);
  };

  const toggleFullScreen = () => {
    setFullScreenViewer(!fullScreenViewer);
  };

  const navigateFile = (direction) => {
    if (direction === "prev") {
      setCurrentFileIndex((prev) =>
        prev > 0 ? prev - 1 : selectedFiles.length - 1
      );
    } else {
      setCurrentFileIndex((prev) =>
        prev < selectedFiles.length - 1 ? prev + 1 : 0
      );
    }
  };

  const setCurrentFile = (index) => {
    setCurrentFileIndex(index);
    if (fullScreenViewer) setFullScreenViewer(true);
  };

  return (
    <div className="mx-auto p-6 space-y-8 max-w-7xl">
      {/* Notification */}
      <AnimatePresence>
        {notification.show && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() =>
              setNotification((prev) => ({ ...prev, show: false }))
            }
          />
        )}
      </AnimatePresence>

      {/* Show loader when submitting */}
      {isSubmitting && (
        <ProgressLoader
          progress={progress}
          message="This may take a while up to 3-5 mins. Please do not navigate or close this window."
        />
      )}
      {/* Upload Popup */}
      {showUploadPopup && (
        <UploadPopup
          onFileChange={handleFileChange}
          onContinue={handleUploadContinue}
          error={errors.files}
          step={uploadStep}
          selectedFiles={selectedFiles}
          onReviewComplete={handleReviewComplete}
          onAddMoreFiles={handleAddMoreFiles}
          currentFileIndex={currentFileIndex}
          onNavigateFile={navigateFile}
          onToggleFullScreen={toggleFullScreen}
          onRemoveFile={removeFile}
        />
      )}

      {/* Main Content (shown after upload steps) */}
      {uploadStep === 2 || selectedFiles.length > 0 ? (
        <>
          <div className="flex justify-end items-center mb-6">
            <CreditHours />
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              New Quote Request
            </h2>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Project Details */}
                <div className="space-y-6">
                  {/* Project Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Project name
                    </label>
                    <input
                      type="text"
                      name="projectName"
                      value={formData.projectName}
                      onChange={handleInputChange}
                      required
                      className={`mt-1 w-full px-4 py-2 border ${
                        errors.projectName
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:ring-blue-400 focus:border-blue-400`}
                    />
                    {errors.projectName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.projectName}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Enter project description or special notes..."
                      className={`mt-1 w-full px-4 py-2 border ${
                        errors.description
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:ring-blue-400 focus:border-blue-400`}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.description}
                      </p>
                    )}
                  </div>

                  {/* Technical Info */}
                  <div>
                    <span className="block text-sm font-medium text-gray-700 mb-2">
                      Technical Information
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className="inline-flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={technicalInfo.designIntent}
                          onChange={(e) => {
                            const newTechInfo = {
                              ...technicalInfo,
                              designIntent: e.target.checked,
                            };
                            setTechnicalInfo(newTechInfo);
                            setErrors((prev) => ({
                              ...prev,
                              technicalInfo: "",
                            }));
                          }}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="text-gray-700 text-sm">
                          Design Intent
                        </span>
                        <InfoIcon infoText="We rebuild the original design by applying dimensions and constraints, ignoring manufacturing errors. This approach is suited for new product development and allows easy edits in CAD software, keeping design history intact." />
                      </label>

                      <label className="inline-flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={technicalInfo.hybridModelling}
                          onChange={(e) => {
                            setTechnicalInfo({
                              ...technicalInfo,
                              hybridModelling: e.target.checked,
                            });
                            setErrors((prev) => ({
                              ...prev,
                              technicalInfo: "",
                            }));
                          }}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="text-gray-700 text-sm">
                          Hybrid Modelling
                        </span>
                        <InfoIcon infoText="We use a mix of as-built/design intent for prismatic shapes and NURBS for organic ones. This method suits parts with both freeform and geometric shapes, allowing accurate CAD conversion and flexible editing in reverse engineering tools." />
                      </label>

                      <label className="inline-flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={technicalInfo.scansToNURBS}
                          onChange={(e) => {
                            setTechnicalInfo({
                              ...technicalInfo,
                              scansToNURBS: e.target.checked,
                            });
                            setErrors((prev) => ({
                              ...prev,
                              technicalInfo: "",
                            }));
                          }}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="text-gray-700 text-sm">
                          Scans to NURBS
                        </span>
                        <InfoIcon infoText="We turn scan data into smooth, accurate NURBS surfaces, ideal for organic shapes. Edits can only be made in reverse engineering software, and files are exportable in formats like IGES or STEP for further use." />
                      </label>

                      <label className="inline-flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={technicalInfo.asBuildModelling}
                          onChange={(e) => {
                            setTechnicalInfo({
                              ...technicalInfo,
                              asBuildModelling: e.target.checked,
                            });
                            setErrors((prev) => ({
                              ...prev,
                              technicalInfo: "",
                            }));
                          }}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="text-gray-700 text-sm">
                          As-Build Modelling
                        </span>
                        <InfoIcon infoText="We create CAD models that exactly match the scanned object, including any manufacturing errors. This method ensures high accuracy and is ideal for replacing existing parts. The final model can be exported for manufacturing or mold development and edited in Geomagic Design X." />
                      </label>
                    </div>
                    {errors.technicalInfo && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.technicalInfo}
                      </p>
                    )}
                  </div>

                  {/* Live Transfer Format */}
                  <span className="block text-md font-medium text-gray-700 mb-2">
                    Live.transfer format
                  </span>

                  {/* Deliverables - Only shown when designIntent is selected */}
                  {technicalInfo.designIntent && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Software Selection */}
<div className="relative">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Software
  </label>
  <select
    value={selectedSoftware}
    onChange={(e) => {
      setSelectedSoftware(e.target.value);
      setSelectedVersion("");
      setDeliverables({
        ...deliverables,
        liveTransferFormat: `${e.target.value}`,
      });
      setErrors((prev) => ({
        ...prev,
        liveTransferFormat: "",
      }));
    }}
    className="w-full appearance-none bg-white border border-gray-300 text-gray-800 px-4 py-2 pr-10 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2990F1] focus:border-[#2990F1]"
  >
    {Object.entries(SOFTWARE_OPTIONS).map(
      ([key, { name }]) => (
        <option key={key} value={key}>
          {name}
        </option>
      )
    )}
  </select>
  <div className="pointer-events-none absolute inset-y-0 right-3 top-7 flex items-center text-gray-400">
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 9l-7 7-7-7"
      />
    </svg>
  </div>
</div>

{/* Version Selection */}
<div className="relative">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Version
  </label>
  <select
    value={selectedVersion}
    onChange={(e) => {
      setSelectedVersion(e.target.value);
      setDeliverables({
        ...deliverables,
        liveTransferFormat: `${selectedSoftware}-${e.target.value}`,
      });
      setErrors((prev) => ({
        ...prev,
        liveTransferFormat: "",
      }));
    }}
    disabled={!selectedSoftware}
    className={`w-full appearance-none bg-white px-4 py-2 pr-10 text-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2990F1] focus:border-[#2990F1] ${
      !selectedSoftware
        ? "border-gray-200 opacity-50 cursor-not-allowed"
        : "border-gray-300"
    }`}
  >
    <option value="">Select version</option>
    {SOFTWARE_OPTIONS[selectedSoftware]?.versions.map(
      (version) => (
        <option key={version} value={version}>
          {version}
        </option>
      )
    )}
  </select>
  <div className="pointer-events-none absolute inset-y-0 right-3 top-7 flex items-center text-gray-400">
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 9l-7 7-7-7"
      />
    </svg>
  </div>
</div>
                      </div>

                      {errors.liveTransferFormat && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.liveTransferFormat}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Additional Options */}
                  <div className="flex flex-wrap gap-4">
                    <label className="inline-flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={deliverables.cadNeutralFiles}
                        onChange={(e) =>
                          setDeliverables({
                            ...deliverables,
                            cadNeutralFiles: e.target.checked,
                          })
                        }
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <span className="text-gray-700 text-sm">
                        CAD neutral files
                      </span>
                      <InfoIcon infoText="Export files in neutral formats like STEP, IGES that can be opened in any CAD software." />
                    </label>
                    {(technicalInfo.designIntent ||
                      technicalInfo.hybridModelling) && (
                      <label className="inline-flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={deliverables.caddraftfiles}
                          onChange={(e) =>
                            setDeliverables({
                              ...deliverables,
                              caddraftfiles: e.target.checked,
                            })
                          }
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="text-gray-700 text-sm">
                          2D Drafting (.dwg)
                        </span>
                        <InfoIcon infoText="Include 2D technical drawings with dimensions and annotations in DWG format." />
                      </label>
                    )}
                  </div>

                  {/* Info Files Section */}
                  <div>
                    <label className="block mb-3 text-sm font-medium text-gray-700">
                      Upload Bill of materials and technical data (Optional)
                    </label>
                    <label
                      htmlFor="info-files-upload"
                      className={`flex flex-col items-center justify-center h-32 border-2 border-dashed ${
                        errors.infoFiles ? "border-red-500" : "border-blue-300"
                      } rounded-lg cursor-pointer hover:bg-blue-50 transition`}
                    >
                      <FiUploadCloud className="text-3xl text-blue-400 mb-2" />
                      <span className="text-sm text-blue-500">
                        Click here to upload your file
                      </span>
                      <span className="text-xs text-gray-500">
                        .xls, .pdf , .ppt , .jpeg , .png , .tif , .mp4
                      </span>
                      <input
                        id="info-files-upload"
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleInfoFilesChange}
                      />
                    </label>
                    {errors.infoFiles && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.infoFiles}
                      </p>
                    )}

                    {infoFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">
                          Selected files:
                        </h4>
                        <ul className="space-y-2">
                          {infoFiles.map((file, index) => (
                            <li
                              key={index}
                              className="flex items-center justify-between bg-gray-50 p-2 rounded"
                            >
                              <span className="text-sm text-gray-700 truncate max-w-xs">
                                {file.name} (
                                {Math.round(file.size / 1024 / 1024)} MB)
                              </span>
                              <button
                                type="button"
                                onClick={() => removeInfoFile(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <FiX />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Files Section */}
                <div className="space-y-6">
                  {selectedFiles.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <button
                        onClick={() => setShowUploadPopup(true)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
                      >
                        <FiUploadCloud className="inline mr-2" />
                        Browse files
                      </button>
                      {errors.files && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.files}
                        </p>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* STL Viewer Section */}
                      <FileViewer
                        files={selectedFiles}
                        currentIndex={currentFileIndex}
                        onNavigate={navigateFile}
                        onToggleFullScreen={toggleFullScreen}
                        fullScreen={false}
                      />

                      {/* Files Summary */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-gray-800">
                            Files ({selectedFiles.length})
                          </h3>
                          <button
                            type="button"
                            onClick={() => {
                              setUploadStep(0);
                              setShowUploadPopup(true);
                            }}
                            className="text-blue-500 hover:text-blue-700 text-sm"
                          >
                            Add Files
                          </button>
                        </div>

                        <div className="max-h-60 overflow-y-auto mb-4">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th
                                  scope="col"
                                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  File
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Size
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 py-2 text-end text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {selectedFiles.map((file, index) => (
                                <tr
                                  key={index}
                                  className={
                                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                  }
                                >
                                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-xs">
                                    {file.name}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                    {Math.round(file.size / 1024 / 1024)} MB
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex justify-end space-x-2">
                                      <button
                                        type="button"
                                        onClick={() => setCurrentFile(index)}
                                        className="text-blue-500 hover:text-blue-700"
                                      >
                                        Preview
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => removeFile(index)}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <FiTrash2 />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting || selectedFiles.length === 0}
                      className={`w-full px-6 py-3 bg-blue-600 text-white rounded-md font-medium
                        ${
                          isSubmitting || selectedFiles.length === 0
                            ? "opacity-70 cursor-not-allowed"
                            : "hover:bg-blue-700"
                        }`}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Quote Request"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <StepsTimeline />
        </>
      ) : (
        <>
          <div className="flex justify-end items-center mb-6">
            <CreditHours />
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              New Quote Request
            </h2>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Project Details */}
                <div className="space-y-6">
                  {/* Project Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Project name
                    </label>
                    <input
                      type="text"
                      name="projectName"
                      value={formData.projectName}
                      onChange={handleInputChange}
                      required
                      className={`mt-1 w-full px-4 py-2 border ${
                        errors.projectName
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:ring-blue-400 focus:border-blue-400`}
                    />
                    {errors.projectName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.projectName}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Enter project description or special notes..."
                      className={`mt-1 w-full px-4 py-2 border ${
                        errors.description
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:ring-blue-400 focus:border-blue-400`}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.description}
                      </p>
                    )}
                  </div>

                  {/* Technical Info */}
                  <div>
                    <span className="block text-sm font-medium text-gray-700 mb-2">
                      Technical Information
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className="inline-flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={technicalInfo.designIntent}
                          onChange={(e) => {
                            const newTechInfo = {
                              ...technicalInfo,
                              designIntent: e.target.checked,
                            };
                            setTechnicalInfo(newTechInfo);
                            setErrors((prev) => ({
                              ...prev,
                              technicalInfo: "",
                            }));
                          }}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="text-gray-700 text-sm">
                          Design Intent
                        </span>
                        <InfoIcon infoText="We rebuild the original design by applying dimensions and constraints, ignoring manufacturing errors. This approach is suited for new product development and allows easy edits in CAD software, keeping design history intact." />
                      </label>

                      <label className="inline-flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={technicalInfo.hybridModelling}
                          onChange={(e) => {
                            setTechnicalInfo({
                              ...technicalInfo,
                              hybridModelling: e.target.checked,
                            });
                            setErrors((prev) => ({
                              ...prev,
                              technicalInfo: "",
                            }));
                          }}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="text-gray-700 text-sm">
                          Hybrid Modelling
                        </span>
                        <InfoIcon infoText="We use a mix of as-built/design intent for prismatic shapes and NURBS for organic ones. This method suits parts with both freeform and geometric shapes, allowing accurate CAD conversion and flexible editing in reverse engineering tools." />
                      </label>

                      <label className="inline-flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={technicalInfo.scansToNURBS}
                          onChange={(e) => {
                            setTechnicalInfo({
                              ...technicalInfo,
                              scansToNURBS: e.target.checked,
                            });
                            setErrors((prev) => ({
                              ...prev,
                              technicalInfo: "",
                            }));
                          }}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="text-gray-700 text-sm">
                          Scans to NURBS
                        </span>
                        <InfoIcon infoText="We turn scan data into smooth, accurate NURBS surfaces, ideal for organic shapes. Edits can only be made in reverse engineering software, and files are exportable in formats like IGES or STEP for further use." />
                      </label>

                      <label className="inline-flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={technicalInfo.asBuildModelling}
                          onChange={(e) => {
                            setTechnicalInfo({
                              ...technicalInfo,
                              asBuildModelling: e.target.checked,
                            });
                            setErrors((prev) => ({
                              ...prev,
                              technicalInfo: "",
                            }));
                          }}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="text-gray-700 text-sm">
                          As-Build Modelling
                        </span>
                        <InfoIcon infoText="We create CAD models that exactly match the scanned object, including any manufacturing errors. This method ensures high accuracy and is ideal for replacing existing parts. The final model can be exported for manufacturing or mold development and edited in Geomagic Design X." />
                      </label>
                    </div>
                    {errors.technicalInfo && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.technicalInfo}
                      </p>
                    )}
                  </div>

                  {/* Live Transfer Format */}
                  <span className="block text-md font-medium text-gray-700 mb-2">
                    Live.transfer format
                  </span>

                  {/* Deliverables - Only shown when designIntent is selected */}
                  {technicalInfo.designIntent && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Software Selection */}
                        {/* Software Selection */}
<div className="relative">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Software
  </label>
  <select
    value={selectedSoftware}
    onChange={(e) => {
      setSelectedSoftware(e.target.value);
      setSelectedVersion("");
      setDeliverables({
        ...deliverables,
        liveTransferFormat: `${e.target.value}`,
      });
      setErrors((prev) => ({
        ...prev,
        liveTransferFormat: "",
      }));
    }}
    className="w-full appearance-none bg-white border border-gray-300 text-gray-800 px-4 py-2 pr-10 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2990F1] focus:border-[#2990F1]"
  >
    {Object.entries(SOFTWARE_OPTIONS).map(
      ([key, { name }]) => (
        <option key={key} value={key}>
          {name}
        </option>
      )
    )}
  </select>
  <div className="pointer-events-none absolute inset-y-0 right-3 top-7 flex items-center text-gray-400">
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 9l-7 7-7-7"
      />
    </svg>
  </div>
</div>

{/* Version Selection */}
<div className="relative">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Version
  </label>
  <select
    value={selectedVersion}
    onChange={(e) => {
      setSelectedVersion(e.target.value);
      setDeliverables({
        ...deliverables,
        liveTransferFormat: `${selectedSoftware}-${e.target.value}`,
      });
      setErrors((prev) => ({
        ...prev,
        liveTransferFormat: "",
      }));
    }}
    disabled={!selectedSoftware}
    className={`w-full appearance-none bg-white px-4 py-2 pr-10 text-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2990F1] focus:border-[#2990F1] ${
      !selectedSoftware
        ? "border-gray-200 opacity-50 cursor-not-allowed"
        : "border-gray-300"
    }`}
  >
    <option value="">Select version</option>
    {SOFTWARE_OPTIONS[selectedSoftware]?.versions.map(
      (version) => (
        <option key={version} value={version}>
          {version}
        </option>
      )
    )}
  </select>
  <div className="pointer-events-none absolute inset-y-0 right-3 top-7 flex items-center text-gray-400">
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 9l-7 7-7-7"
      />
    </svg>
  </div>
</div>
                      </div>

                      {errors.liveTransferFormat && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.liveTransferFormat}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Additional Options */}
                  <div className="flex flex-wrap gap-4">
                    <label className="inline-flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={deliverables.cadNeutralFiles}
                        onChange={(e) =>
                          setDeliverables({
                            ...deliverables,
                            cadNeutralFiles: e.target.checked,
                          })
                        }
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <span className="text-gray-700 text-sm">
                        CAD neutral files
                      </span>
                      <InfoIcon infoText="Export files in neutral formats like STEP, IGES that can be opened in any CAD software." />
                    </label>
                    {(technicalInfo.designIntent ||
                      technicalInfo.hybridModelling) && (
                      <label className="inline-flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={deliverables.caddraftfiles}
                          onChange={(e) =>
                            setDeliverables({
                              ...deliverables,
                              caddraftfiles: e.target.checked,
                            })
                          }
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="text-gray-700 text-sm">
                          2D Drafting (.dwg)
                        </span>
                        <InfoIcon infoText="Include 2D technical drawings with dimensions and annotations in DWG format." />
                      </label>
                    )}
                  </div>

                  {/* Info Files Section */}
                  <div>
                    <label className="block mb-3 text-sm font-medium text-gray-700">
                      Upload Bill of materials and technical data (Optional)
                    </label>
                    <label
                      htmlFor="info-files-upload"
                      className={`flex flex-col items-center justify-center h-32 border-2 border-dashed ${
                        errors.infoFiles ? "border-red-500" : "border-blue-300"
                      } rounded-lg cursor-pointer hover:bg-blue-50 transition`}
                    >
                      <FiUploadCloud className="text-3xl text-blue-400 mb-2" />
                      <span className="text-sm text-blue-500">
                        Click here to upload your file
                      </span>
                      <span className="text-xs text-gray-500">
                        .xls, .pdf , .ppt , .jpeg , .png , .tif , .mp4
                      </span>
                      <input
                        id="info-files-upload"
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleInfoFilesChange}
                      />
                    </label>
                    {errors.infoFiles && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.infoFiles}
                      </p>
                    )}

                    {infoFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">
                          Selected files:
                        </h4>
                        <ul className="space-y-2">
                          {infoFiles.map((file, index) => (
                            <li
                              key={index}
                              className="flex items-center justify-between bg-gray-50 p-2 rounded"
                            >
                              <span className="text-sm text-gray-700 truncate max-w-xs">
                                {file.name} (
                                {Math.round(file.size / 1024 / 1024)} MB)
                              </span>
                              <button
                                type="button"
                                onClick={() => removeInfoFile(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <FiX />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Files Section */}
                <div className="space-y-6 flex flex-col justify-between">
                 <div>
    <label className="block text-sm font-medium mb-2 text-gray-700">
      Upload files
    </label>
    <div 
      className="text-center py-8 border-2 border-dashed border-blue-500 rounded-lg"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <button
        onClick={() => setShowUploadPopup(true)}
        className="px-6 py-3 w-full text-center grid text-blue-500 rounded-md font-lg"
      >
        <FiUploadCloud className="inline m-auto" />
        {isDragging ? "Drop files here" : "Browse your files"}
      </button>
    </div>
    {errors.files && (
      <p className="mt-2 text-sm text-red-600">
        {errors.files}
      </p>
    )}
  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={true}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-md font-medium opacity-70 cursor-not-allowed"
                    >
                      Submit Quote Request
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <StepsTimeline />
        </>
      )}

      {/* Full Screen STL Viewer */}
      {fullScreenViewer && (
        <FullScreenViewer
          files={selectedFiles}
          currentIndex={currentFileIndex}
          onNavigate={navigateFile}
          onClose={toggleFullScreen}
          onRemoveFile={removeFile}
        />
      )}
    </div>
  );
};

export default NewQuoteRequest;
