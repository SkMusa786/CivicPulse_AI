import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, RefreshCw, CheckCircle2 } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (imageFile: File | null, previewUrl: string | null) => void;
  selectedPreview: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  selectedPreview,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPG, PNG, or WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Image files must be 10 MB or smaller.');
      return;
    }

    setFileName(file.name);
    setFileSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        onImageSelected(file, reader.result);
      } else {
        alert('Unable to read this image file.');
      }
    };
    reader.onerror = () => alert('Unable to read this image file.');
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    setFileName('');
    setFileSize('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    onImageSelected(null, null);
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      {!selectedPreview ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-600 bg-blue-50/60'
              : 'border-slate-300 hover:border-blue-500 bg-white hover:bg-slate-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />

          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h4 className="text-base font-semibold text-slate-800">
            Upload Photograph of Civic Problem
          </h4>
          <p className="mt-1 text-sm text-slate-500">
            Drag and drop your image here, or <span className="text-blue-600 font-medium">browse files</span>
          </p>
          <p className="mt-3 text-xs text-slate-400">
            Supports JPG, JPEG, PNG, WEBP (Up to 10 MB)
          </p>
        </div>
      ) : (
        /* Image Preview Box */
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="relative aspect-video max-h-80 w-full bg-slate-900 flex items-center justify-center overflow-hidden">
            <img
              src={selectedPreview}
              alt="Civic issue preview"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-black/70 hover:bg-black/90 text-white rounded-lg backdrop-blur-xs transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Replace</span>
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 bg-black/70 hover:bg-rose-600 text-white rounded-lg backdrop-blur-xs transition-colors"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-2.5 py-1 rounded-md backdrop-blur-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Image captured & ready for AI analysis</span>
            </div>
          </div>

          <div className="p-4 flex items-center justify-between text-xs text-slate-600 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2 truncate">
              <ImageIcon className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="font-medium text-slate-800 truncate">{fileName || 'civic-defect-photo.jpg'}</span>
              {fileSize && <span className="text-slate-400">({fileSize})</span>}
            </div>
            <span className="text-slate-500 font-mono text-[11px]">Exif GPS tagged</span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />
        </div>
      )}

    </div>
  );
};
