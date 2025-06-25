import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiX, FiCheck } from 'react-icons/fi';

const FileIssueReport = ({ files, onSubmit, onCancel, initialFileId = null }) => {
  const [fileReports, setFileReports] = useState({});
  const [mainNote, setMainNote] = useState('');

  useEffect(() => {
    if (initialFileId) {
      setFileReports(prev => ({
        ...prev,
        [initialFileId]: {
          status: 'issued',
          note: ''
        }
      }));
    }
  }, [initialFileId]);

  const toggleFileIssue = (fileId) => {
    setFileReports(prev => ({
      ...prev,
      [fileId]: {
        ...prev[fileId],
        status: prev[fileId]?.status === 'issued' ? 'ok' : 'issued'
      }
    }));
  };

  const handleNoteChange = (fileId, note) => {
    setFileReports(prev => ({
      ...prev,
      [fileId]: {
        ...prev[fileId],
        note
      }
    }));
  };

  const handleSubmit = () => {
    const reports = Object.entries(fileReports)
      .filter(([_, report]) => report.status === 'issued')
      .map(([fileId, report]) => ({
        fileId,
        status: report.status,
        note: report.note || ''
      }));

    onSubmit({
      fileReports: reports,
      mainNote
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold flex items-center">
          <FiAlertTriangle className="text-yellow-500 mr-2" />
          Report File Issues
        </h3>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <FiX size={20} />
        </button>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          General Notes
        </label>
        <textarea
          value={mainNote}
          onChange={(e) => setMainNote(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="Describe any general issues..."
        />
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Mark Problematic Files
        </h4>
        <div className="space-y-4">
          {files.map((file, index) => (
            <div key={file._id} className="flex items-start space-x-4">
              <div className="flex items-center h-5 mt-1">
                <input
                  type="checkbox"
                  checked={fileReports[file._id]?.status === 'issued'}
                  onChange={() => toggleFileIssue(file._id)}
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  File {index + 1}: {file.originalFile?.split('/').pop()}
                </label>
                {fileReports[file._id]?.status === 'issued' && (
                  <textarea
                    value={fileReports[file._id]?.note || ''}
                    onChange={(e) => handleNoteChange(file._id, e.target.value)}
                    placeholder="Describe issues with this file..."
                    className="w-full mt-2 p-2 border border-gray-300 rounded-md text-sm"
                    rows={2}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!Object.values(fileReports).some(report => report.status === 'issued') && !mainNote}
          className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm font-medium hover:bg-yellow-700 disabled:bg-yellow-300 flex items-center"
        >
          <FiCheck className="mr-1" />
          Submit Issues
        </button>
      </div>
    </div>
  );
};

export default FileIssueReport;