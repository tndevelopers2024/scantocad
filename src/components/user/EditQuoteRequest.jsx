import React, { useState, useEffect } from 'react';
import { getQuotationById, updateQuote } from '../../api';
import CreditHours from './CreditHours';
import STLViewer from '../../contexts/STLViewer';
import { useNavigate, useParams } from 'react-router-dom';
import Loader from '../../contexts/Loader';
import {
  FiUploadCloud,
  FiFileText,
  FiCheckCircle,
  FiCreditCard,
  FiDollarSign,
  FiDownload,
  FiFile,
} from 'react-icons/fi';
import Notification from "../../contexts/Notification";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  { label: 'Request quote', icon: <FiUploadCloud /> },
  { label: 'Receive Quotation', icon: <FiFileText /> },
  { label: 'Accept Quote', icon: <FiCheckCircle /> },
  { label: 'Add credit hrs or upload PO', icon: <FiCreditCard /> },
  { label: 'Make payment', icon: <FiDollarSign /> },
  { label: 'Receive Project Files', icon: <FiDownload /> },
];

const EditQuoteRequest = () => {
  const { id } = useParams();
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
  const [fileUrl, setFileUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState("success");
  const [notificationMessage, setNotificationMessage] = useState("");

  const showTempNotification = (message, type = "success") => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await getQuotationById(id);
        const quote = response.data;
        
        setProjectName(quote.projectName || '');
        setDescription(quote.description || '');
        
        // Parse technical info
        const techInfo = {
          designIntent: quote.technicalInfo?.includes('designIntent') || false,
          hybridModelling: quote.technicalInfo?.includes('hybridModelling') || false,
          scansToNURBS: quote.technicalInfo?.includes('scansToNURBS') || false,
          asBuildModelling: quote.technicalInfo?.includes('asBuildModelling') || false,
        };
        setTechnicalInfo(techInfo);
        
        // Parse deliverables
        const deliverableInfo = {
          liveTransferFormat: quote.deliverables?.includes('solidworks') ? 'solidworks' : 
                            quote.deliverables?.includes('creo') ? 'creo' :
                            quote.deliverables?.includes('inventor') ? 'inventor' : 'others',
          cadNeutralFiles: quote.deliverables?.includes('CAD Neutral Files: Yes') || false,
        };
        setDeliverables(deliverableInfo);
        
        // Set file URL if exists
        if (quote.file) {
          setFileUrl(`https://ardpgimerchd.org${quote.file}`);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching quote:', error);
        showTempNotification("Failed to load quote details", "error");
        navigate('/app/my-quotations');
      }
    };

    fetchQuote();
  }, [id, navigate]);

  const handleFileChange = e => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      // Clear the file URL when a new file is selected
      setFileUrl(null);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (isSubmitting) return;
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
      await updateQuote(formData, id);
      showTempNotification("Quote updated successfully!");

      setTimeout(() => {
        navigate('/app/my-quotations');
      }, 2000);

    } catch (err) {
      console.error(err);
      showTempNotification("Failed to update quote. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFileNameFromUrl = (url) => {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.split('/').pop();
    } catch {
      return url.split('/').pop();
    }
  };

  if (isLoading) {
    return <Loader message="Loading quote details..." />;
  }

  return (
    <div className="mx-auto p-6 space-y-8 max-w-7xl">
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
      {isSubmitting && <Loader message='Please wait! Your updates are being saved!' />}

      <div className="flex justify-end items-center mb-6">
        <CreditHours />
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">Edit Quote Request</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Project Name */}
              <div>
                <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">
                  Project name
                </label>
                <input
                  id="projectName"
                  type="text"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  required
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-400 focus:border-blue-400"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Enter project description or special notes..."
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-400 focus:border-blue-400"
                />
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
                        onChange={e =>
                          setTechnicalInfo({ ...technicalInfo, [key]: e.target.checked })
                        }
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-400"
                      />
                      <span className="text-gray-700 text-sm">
                        {key
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, str => str.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Deliverables */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="liveTransferFormat" className="block text-sm font-medium text-gray-700">
                    Live transfer format
                  </label>
                  <select
                    id="liveTransferFormat"
                    required
                    value={deliverables.liveTransferFormat}
                    onChange={e =>
                      setDeliverables({
                        ...deliverables,
                        liveTransferFormat: e.target.value,
                      })
                    }
                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-400 focus:border-blue-400"
                  >
                    <option value="">---select option---</option>
                    <option value="solidworks">Solidworks - .sldprt</option>
                    <option value="creo">Creo - .prt</option>
                    <option value="inventor">Inventor - .iam,ipt</option>
                    <option value="others">Others</option>
                  </select>
                </div>
                <label className="inline-flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={deliverables.cadNeutralFiles}
                    onChange={e =>
                      setDeliverables({ ...deliverables, cadNeutralFiles: e.target.checked })
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-400"
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
                  {selectedFile ? 'Replace file' : fileUrl ? 'Current file' : 'Upload file'}
                </label>
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:bg-blue-50 transition"
                >
                  {selectedFile ? (
                    <>
                      <FiUploadCloud className="text-3xl text-blue-400 mb-2" />
                      <span className="text-sm text-blue-500 text-center px-2 truncate max-w-xs">
                        {selectedFile.name}
                      </span>
                    </>
                  ) : fileUrl ? (
                    <>
                      <FiFile className="text-3xl text-blue-400 mb-2" />
                      <span className="text-sm text-blue-500 text-center px-2 truncate max-w-xs">
                        {getFileNameFromUrl(fileUrl)}
                      </span>
                    </>
                  ) : (
                    <>
                      <FiUploadCloud className="text-3xl text-blue-400 mb-2" />
                      <span className="text-sm text-blue-500">Click here to upload your file</span>
                    </>
                  )}
                  <input
                    id="file-upload"
                    type="file"
                    accept=".stl,.STL"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                {fileUrl && !selectedFile && (
                  <div className="mt-2 flex items-center text-sm text-gray-600">
                    <span className="font-medium mr-2">Current file:</span>
                    <a 
                      href={fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline truncate max-w-xs"
                    >
                      {getFileNameFromUrl(fileUrl)}
                    </a>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  disabled={!selectedFile && !fileUrl}
                  className={`flex-1 px-6 py-2 rounded-md border border-blue-400 text-blue-600 font-medium transition-colors
                    ${!selectedFile && !fileUrl ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50'}`}
                >
                  Preview file
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 px-6 py-2 bg-blue-600 text-white rounded-md font-medium transition-colors
                    ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                >
                  {isSubmitting ? 'Updating...' : 'Update Quote'}
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
      <AnimatePresence>
        {showModal && (selectedFile || fileUrl) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <div className="bg-white rounded-lg overflow-hidden w-full max-w-4xl h-[80vh] flex flex-col">
              <div className="flex justify-between items-center px-6 py-4 border-b">
                <h4 className="text-lg font-semibold">STL File Preview</h4>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                  aria-label="Close preview"
                >
                  &times;
                </button>
              </div>
              <div className="flex-1">
<STLViewer 
  file={ fileUrl ? fileUrl : URL.createObjectURL(selectedFile) } 
/>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EditQuoteRequest;