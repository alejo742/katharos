import React, { useState } from 'react';
import { CloudUpload } from '@mui/icons-material';
import StorageRepository from '../../repositories/storage.repository';
import './ImageUploader.css';

interface ImageUploaderProps {
  onUploadComplete: (urls: string[]) => void;
  productId?: string;
  multiple?: boolean;
  maxFiles?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUploadComplete,
  productId,
  multiple = true,
  maxFiles = 5
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Check if number of files exceeds the limit
    if (multiple && files.length > maxFiles) {
      setError(`Solo puedes subir hasta ${maxFiles} imágenes a la vez.`);
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const next = prev + 5;
          return next > 90 ? 90 : next;
        });
      }, 300);
      
      // Upload files
      const urls = await StorageRepository.uploadMultipleImages(
        Array.from(files), 
        productId
      );
      
      // Clear progress simulation and set to 100%
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Notify parent component
      onUploadComplete(urls);
      
      // Reset form
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        // Reset the file input
        e.target.value = '';
      }, 1000);
    } catch (err) {
      setError('Error al subir las imágenes. Por favor, inténtalo de nuevo.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="image-uploader">
      <div className={`upload-area ${isUploading ? 'uploading' : ''}`}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          multiple={multiple}
          disabled={isUploading}
          className="file-input"
          id="file-input"
        />
        <label htmlFor="file-input" className="upload-label">
          {isUploading ? (
            <div className="upload-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <span>{uploadProgress}% Subiendo...</span>
            </div>
          ) : (
            <>
              <CloudUpload className="upload-icon" />
              <span>
                {multiple
                  ? `Arrastra o haz clic para subir imágenes (máx. ${maxFiles})`
                  : 'Arrastra o haz clic para subir una imagen'}
              </span>
            </>
          )}
        </label>
      </div>
      
      {error && <div className="upload-error">{error}</div>}
    </div>
  );
};

export default ImageUploader;