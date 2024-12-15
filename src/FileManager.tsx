import React, { useState } from 'react';
import { UploadedFile } from './types';
import './FileManager.css';



interface FileManagerProps {
  onFilesChange?: (files: UploadedFile[]) => void;
}

const FileManager: React.FC<FileManagerProps> = ({ onFilesChange  }) => {

  const [files, setFiles] = useState<UploadedFile[]>(() => {
    const savedFiles = localStorage.getItem('fileManager');
    return savedFiles ? JSON.parse(savedFiles) : [];
  });

  const [isDragging, setIsDragging] = useState(false); 

  const saveToLocalStorage = (updatedFiles: UploadedFile[]) => {
    localStorage.setItem('fileManager', JSON.stringify(updatedFiles));
  };

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles: UploadedFile[] = Array.from(fileList).map((file) => ({
      id: `${file.name}-${Date.now()}`,
      name: file.name,
      type: file.type,
      data: URL.createObjectURL(file),
    }));

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    saveToLocalStorage(updatedFiles);

    if (onFilesChange) {
      onFilesChange(updatedFiles);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false); 
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true); 
  };

  const handleDragLeave = () => {
    setIsDragging(false); 
  };

  const handleDelete = (fileId: string) => {
    const updatedFiles = files.filter((file) => file.id !== fileId);
    setFiles(updatedFiles);
    saveToLocalStorage(updatedFiles);

    if (onFilesChange) {
      onFilesChange(updatedFiles);
    }
  };

  return (
    <div
      className="FileManager"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <header className="Manager-header">
        <h1>File Manager</h1>

        {isDragging && (
          <div className="overlay">
            <p>Drag and drop files here</p>
          </div>
        )}

        <div className="upload-button-container">
          <button
            className="upload-button"
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            Click to upload files
          </button>
          <input
            id="fileInput"
            type="file"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            style={{ display: 'none' }}
          />
        </div>

        <div className="file-grid">
          {files.map((file) => (
            <div key={file.id} className="file-card">
              <button className="delete-button" onClick={() => handleDelete(file.id)}>
                ✖
              </button>
              {file.type.startsWith('image/') ? (
                <img src={file.data} alt={file.name} className="file-thumbnail" />
              ) : (
                <div className="file-icon">📄</div>
              )}
              <p className="file-name">{file.name}</p>
            </div>
          ))}
        </div>
      </header>
    </div>
  );
};

export default FileManager;
