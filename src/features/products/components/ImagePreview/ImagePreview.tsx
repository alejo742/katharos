import React from 'react';
import { Delete, DragIndicator } from '@mui/icons-material';
import './ImagePreview.css';

interface ImagePreviewProps {
  images: string[];
  onRemove: (index: number) => void;
  onReorder?: (startIndex: number, endIndex: number) => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  images,
  onRemove,
  onReorder
}) => {
  // Handle drag start
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('dragging');
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, newIndex: number) => {
    e.preventDefault();
    const startIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (onReorder && startIndex !== newIndex) {
      onReorder(startIndex, newIndex);
    }
  };

  // Handle drag end
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('dragging');
  };

  return (
    <div className="image-preview-container">
      <h3>Imágenes del Producto</h3>
      {images.length === 0 ? (
        <p className="no-images">No hay imágenes cargadas</p>
      ) : (
        <div className="image-grid">
          {images.map((url, index) => (
            <div 
              key={url}
              className="image-item"
              draggable={!!onReorder}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div className="image-wrapper">
                <img src={url} alt={`Product image ${index + 1}`} />
                <div className="image-actions">
                  {onReorder && (
                    <button 
                      type="button" 
                      className="drag-handle" 
                      title="Arrastrar para reordenar"
                    >
                      <DragIndicator />
                    </button>
                  )}
                  <button 
                    type="button" 
                    className="remove-button" 
                    onClick={() => onRemove(index)}
                    title="Eliminar imagen"
                  >
                    <Delete />
                  </button>
                </div>
              </div>
              {index === 0 && <span className="primary-badge">Principal</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImagePreview;