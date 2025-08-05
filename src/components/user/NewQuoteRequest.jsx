import React, { useState, useEffect } from "react";
import { requestQuote } from "../../api";
import { useNavigate } from "react-router-dom";
import CreditHours from "./CreditHours";
import {
  STEPS,
  SOFTWARE_OPTIONS,
  ALLOWED_INFO_FILE_EXTENSIONS,
} from "./NewQuoteRequest/constants";
import FileViewer from "./NewQuoteRequest/FileUpload/FileViewer";
import FullScreenViewer from "./NewQuoteRequest/FileUpload/FullScreenViewer";
import UploadPopup from "./NewQuoteRequest/FileUpload/UploadPopup";
import ProjectDetails from "./NewQuoteRequest/FormSections/ProjectDetails";
import InfoFiles from "./NewQuoteRequest/FormSections/InfoFiles";
import Deliverables from "./NewQuoteRequest/FormSections/Deliverables";
import TechnicalInfo from "./NewQuoteRequest/FormSections/TechnicalInfo";
import InfoIcon from "./NewQuoteRequest/UI/InfoIcon";
import StepsTimeline from "./NewQuoteRequest/UI/StepsTimeline";
import ProgressLoader from "./NewQuoteRequest/UI/ProgressLoader";
import Notification from "../../contexts/Notification";
import { motion, AnimatePresence } from "framer-motion";
import UploadSection from "./NewQuoteRequest/FileUpload/UploadSection";
import UploadSummary from "./NewQuoteRequest/FileUpload/UploadSummary";

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
  const [fileInputType, setFileInputType] = useState("upload");
  const [fileLinks, setFileLinks] = useState([""]);
const [isLinkReviewing, setIsLinkReviewing] = useState(false);

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
          files: files,
        },
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
    if (technicalInfo.designIntent) {
      if (selectedSoftware && !selectedVersion) {
        newErrors.liveTransferFormat =
          "Please select a version for the chosen software.";
        isValid = false;
      }
    }

    // Files validation
if (fileInputType === "upload") {
  if (selectedFiles.length === 0) {
    newErrors.files = "At least one file is required";
    isValid = false;
  } else {
    for (const file of selectedFiles) {
      const MAX_SIZE = 5 * 1024 * 1024 * 1024; // 5GB in bytes
      const allowedExtensions = ["stl", "ply", "obj"];

      if (file.size > MAX_SIZE) {
        newErrors.files = `File ${file.name} exceeds 5GB size limit`;
        isValid = false;
        break;
      }

      const ext = file.name.split(".").pop().toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        newErrors.files = `File ${file.name} has invalid extension. Allowed: .${allowedExtensions.join(", .")}`;
        isValid = false;
        break;
      }
    }
  }
} else if (fileInputType === "link") {
  const hasValidLink = fileLinks.some((link) => link.trim() !== "");
  if (!hasValidLink) {
    newErrors.files = "Please provide at least one valid cloud/drive link";
    isValid = false;
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

 // Always add uploaded files if present
if (selectedFiles.length > 0) {
  selectedFiles.forEach((file) => {
    formDataToSend.append("originalFiles", file);
  });
}

// Always add links if present
const validLinks = fileLinks
  .map((link) => link.trim())
  .filter((link) => link !== "");

if (validLinks.length > 0) {
  formDataToSend.append("originalLinks", JSON.stringify(validLinks));
}


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
        navigate("/app/my-quotations");
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

      {/* Main Content */}
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
              <ProjectDetails
                formData={formData}
                errors={errors}
                handleInputChange={handleInputChange}
              />

              <TechnicalInfo
                technicalInfo={technicalInfo}
                setTechnicalInfo={setTechnicalInfo}
                errors={errors}
                setErrors={setErrors}
              />

              <Deliverables
                technicalInfo={technicalInfo}
                deliverables={deliverables}
                setDeliverables={setDeliverables}
                selectedSoftware={selectedSoftware}
                setSelectedSoftware={setSelectedSoftware}
                selectedVersion={selectedVersion}
                setSelectedVersion={setSelectedVersion}
                errors={errors}
                setErrors={setErrors}
                SOFTWARE_OPTIONS={SOFTWARE_OPTIONS}
              />

              <InfoFiles
                infoFiles={infoFiles}
                handleInfoFilesChange={handleInfoFilesChange}
                removeInfoFile={removeInfoFile}
                errors={errors}
                ALLOWED_INFO_FILE_EXTENSIONS={ALLOWED_INFO_FILE_EXTENSIONS}
              />
            </div>

            {/* Right Column - Files Section */}
            <div className="space-y-6 flex flex-col justify-between">
              {(fileInputType === "upload" && selectedFiles.length === 0) ||
 (fileInputType === "link" && !isLinkReviewing) ? (
                <UploadSection
                  setShowUploadPopup={() => {
                    setUploadStep(0);
                    setShowUploadPopup(true);
                  }}
                  errors={errors}
                  isDragging={isDragging}
                  handleDragEnter={handleDragEnter}
                  handleDragLeave={handleDragLeave}
                  handleDragOver={handleDragOver}
                  handleDrop={handleDrop}
                  fileInputType={fileInputType}
                  setFileInputType={setFileInputType}
                  fileLinks={fileLinks}
                  setFileLinks={setFileLinks}
                   onLinkReviewComplete={() => setIsLinkReviewing(true)}
                />
              ) : (
                <>
                  <FileViewer
                    files={selectedFiles}
                    currentIndex={currentFileIndex}
                    onNavigate={navigateFile}
                    onToggleFullScreen={toggleFullScreen}
                    fullScreen={false}
                  />

                <UploadSummary
  selectedFiles={selectedFiles}
  fileLinks={fileLinks}
  setFileLinks={setFileLinks} 
  setUploadStep={setUploadStep}
  setShowUploadPopup={setShowUploadPopup}
  setCurrentFile={setCurrentFile}
  removeFile={removeFile}
  removeFileLink={(index) => {
    const newLinks = [...fileLinks];
    newLinks.splice(index, 1);
    setFileLinks(newLinks);
  }}
/>
                </>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <button
  type="submit"
  disabled={
    isSubmitting ||
    (fileInputType === "upload" && selectedFiles.length === 0) ||
    (fileInputType === "link" &&
      fileLinks.every((link) => link.trim() === ""))
  }
  className={`w-full px-6 py-3 bg-blue-600 text-white rounded-md font-medium
    ${
      isSubmitting ||
      (fileInputType === "upload" && selectedFiles.length === 0) ||
      (fileInputType === "link" &&
        fileLinks.every((link) => link.trim() === ""))
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

      <StepsTimeline steps={STEPS} />

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
