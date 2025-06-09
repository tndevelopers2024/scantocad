import React, { useState } from 'react';
import { requestQuote } from '../../api';
import CreditHours from './CreditHours';
import STLViewer from '../../contexts/STLViewer';
import { useNavigate } from 'react-router-dom';
import Loader from '../../contexts/Loader';
import {
  FiUploadCloud,
  FiFileText,
  FiCheckCircle,
  FiCreditCard,
  FiDollarSign,
  FiDownload,
  FiUser,
} from 'react-icons/fi';
import Notification from "../../contexts/Notification";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  { label: 'Quote Requested', icon: <FiUploadCloud /> },
  { label: 'Receive Quotation', icon: <FiFileText /> },
  { label: 'Accept or Reject Quote', icon: <FiCheckCircle /> },
  { label: 'Add credit hrs or upload PO', icon: <FiCreditCard /> },
  { label: 'Work in Progress', icon: <FiUser /> },
  { label: 'Receive Files', icon: <FiDownload /> },
];

const NewQuoteRequest = () => {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [technicalInfo, setTechnicalInfo] = useState({
    designIntent: false,
    hybridModelling: false,
    scansToNURBS: false,
    asBuildModelling: false,
  });
  const [deliverables, setDeliverables] = useState({
    liveTransferFormat: '',
    cadNeutralFiles: false,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState("success");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [errors, setErrors] = useState({
    projectName: '',
    description: '',
    technicalInfo: '',
    liveTransferFormat: '',
    file: ''
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      projectName: '',
      description: '',
      technicalInfo: '',
      liveTransferFormat: '',
      file: ''
    };

    // Validate project name
    if (!projectName.trim()) {
      newErrors.projectName = 'Project name is required';
      isValid = false;
    } else if (projectName.length > 100) {
      newErrors.projectName = 'Project name must be less than 100 characters';
      isValid = false;
    }

    // Validate description
    if (!description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    } else if (description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
      isValid = false;
    }

    // Validate at least one technical info is selected
    if (!Object.values(technicalInfo).some(val => val)) {
      newErrors.technicalInfo = 'At least one technical information option must be selected';
      isValid = false;
    }

    // Validate live transfer format
    if (!deliverables.liveTransferFormat) {
      newErrors.liveTransferFormat = 'Live transfer format is required';
      isValid = false;
    }

    // Validate file
    if (!selectedFile) {
      newErrors.file = 'File upload is required';
      isValid = false;
    } else if (selectedFile.size > 1024 * 1024 * 1024) { // 50MB limit
      newErrors.file = 'File size must be less than 50MB';
      isValid = false;
    } else if (!selectedFile.name.toLowerCase().endsWith('.stl')) {
      newErrors.file = 'Only STL files are accepted';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    setSelectedFile(file);
    
    // Clear file error when new file is selected
    if (file) {
      setErrors(prev => ({ ...prev, file: '' }));
    }
  };

  const showTempNotification = (message, type = "success") => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) {
      showTempNotification("Please fix the errors in the form", "error");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('projectName', projectName);
    formData.append('description', description);

    const technicalInfoString = Object.entries(technicalInfo)
      .filter(([_, value]) => value)
      .map(([key]) => key)
      .join(', ');

    const deliverablesString = `Live Transfer: ${deliverables.liveTransferFormat}, CAD Neutral Files: ${deliverables.cadNeutralFiles ? 'Yes' : 'No'}`;

    formData.append('technicalInfo', technicalInfoString);
    formData.append('deliverables', deliverablesString);

    if (selectedFile) formData.append('file', selectedFile);

    try {
      await requestQuote(formData);
      showTempNotification("Quote request submitted successfully!");

      // Delay navigation to give time for the success message to show
      setTimeout(() => {
        navigate('/my-quotations');
      }, 4000);

    } catch (err) {
      console.error(err);
      showTempNotification("Failed to submit quote request. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto p-6 space-y-8">
      {/* Notification */}
      <AnimatePresence>
        {showNotification && (
          <Notification
            message={notificationMessage}
            type={notificationType}
            onClose={() => setShowNotification(false)}
          />
        )}
      </AnimatePresence>

      {/* Show loader when submitting */}
      {isSubmitting && <Loader message='This may take a while upto 3-5 mins. Please do not navigate or close this window.' />}

      <div className="flex justify-end items-center mb-6">
        <CreditHours />
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">New Quote Request</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Project name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={e => {
                    setProjectName(e.target.value);
                    setErrors(prev => ({ ...prev, projectName: '' }));
                  }}
                  required
                  className={`mt-1 w-full px-4 py-2 border ${errors.projectName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-blue-400 focus:border-blue-400`}
                />
                {errors.projectName && (
                  <p className="mt-1 text-sm text-red-600">{errors.projectName}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={description}
                  onChange={e => {
                    setDescription(e.target.value);
                    setErrors(prev => ({ ...prev, description: '' }));
                  }}
                  rows={4}
                  placeholder="Enter project description or special notes..."
                  className={`mt-1 w-full px-4 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-blue-400 focus:border-blue-400`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Technical Info */}
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-2">
                  Technical Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(technicalInfo).map(([key, val]) => (
                    <label key={key} className="inline-flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={e => {
                          setTechnicalInfo({ ...technicalInfo, [key]: e.target.checked });
                          setErrors(prev => ({ ...prev, technicalInfo: '' }));
                        }}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <span className="text-gray-700 text-sm">
                        {key
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, str => str.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.technicalInfo && (
                  <p className="mt-1 text-sm text-red-600">{errors.technicalInfo}</p>
                )}
              </div>

              {/* Deliverables */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Live transfer format
                  </label>
                  <select
                    required
                    value={deliverables.liveTransferFormat}
                    onChange={e => {
                      setDeliverables({
                        ...deliverables,
                        liveTransferFormat: e.target.value,
                      });
                      setErrors(prev => ({ ...prev, liveTransferFormat: '' }));
                    }}
                    className={`mt-1 w-full px-4 py-2 border capitalize ${errors.liveTransferFormat ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-blue-400 focus:border-blue-400`}
                  >
                    <option value="">---select option---</option>
                    <option value="solidworks">Solidworks - .sldprt</option>
                    <option value="creo">Creo - .prt</option>
                    <option value="inventor">Inventor - .iam,ipt</option>
                    <option value="others">Others</option>
                  </select>
                  {errors.liveTransferFormat && (
                    <p className="mt-1 text-sm text-red-600">{errors.liveTransferFormat}</p>
                  )}
                </div>
                <label className="inline-flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={deliverables.cadNeutralFiles}
                    onChange={e =>
                      setDeliverables({ ...deliverables, cadNeutralFiles: e.target.checked })
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <span className="text-gray-700 text-sm">CAD neutral files</span>
                </label>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Upload File */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Upload your file
                </label>
                <label
                  htmlFor="file-upload"
                  className={`flex flex-col items-center justify-center h-40 border-2 border-dashed ${errors.file ? 'border-red-500' : 'border-blue-300'} rounded-lg cursor-pointer hover:bg-blue-50 transition`}
                >
                  <FiUploadCloud className="text-3xl text-blue-400 mb-2" />
                  <span className="text-sm text-blue-500">Click here to upload your file</span>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".stl"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                {selectedFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: <span className="font-medium">{selectedFile.name}</span> ({Math.round(selectedFile.size / 1024 / 1024)} MB)
                  </p>
                )}
                {errors.file && (
                  <p className="mt-1 text-sm text-red-600">{errors.file}</p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  disabled={!selectedFile || !!errors.file}
                  className={`flex-1 px-6 py-2 rounded-md border border-blue-400 text-blue-600 font-medium
                    ${!selectedFile || errors.file ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50'}`}
                >
                  Preview file
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 px-6 py-2 bg-blue-600 text-white rounded-md font-medium
                    ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Steps Timeline */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">
          Steps to Receive Your CAD File
        </h3>
        <div className="relative">
          <div className="absolute inset-0 top-[-20px] flex items-center" aria-hidden="true">
            <div className="w-full border-t-2 border-dashed border-blue-200" />
          </div>

          <div className="relative flex justify-between space-x-4">
            {steps.map(({ label, icon }, idx) => (
              <div key={idx} className="flex time-lines flex-col items-center text-sm text-gray-700">
                <div className="bg-white p-3 first-line rounded-full shadow-md text-blue-600 text-xl">
                  {icon}
                </div>
                <span className="mt-2 text-center">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STL Preview Modal */}
      {showModal && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg overflow-hidden w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h4 className="text-lg font-semibold">STL File Preview</h4>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>
            <div className="flex-1">
              <STLViewer file={selectedFile} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewQuoteRequest;