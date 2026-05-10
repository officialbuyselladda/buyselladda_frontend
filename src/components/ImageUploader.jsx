import { useEffect, useRef, useState } from 'react';
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { getImageUrl, placeholderImage } from '../utils/image';

const ImageUploader = ({ onImagesChange, existingImages = [] }) => {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState(existingImages);
  const previewUrlsRef = useRef(new Set());

  useEffect(() => {
    setImages(Array.isArray(existingImages) ? existingImages : []);
  }, [existingImages]);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
      previewUrlsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    onImagesChange(images.filter((image) => !image.uploading && image.url));
  }, [images, onImagesChange]);

  const handleUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    previewUrlsRef.current.add(previewUrl);
    const tempId = `local-${Date.now()}-${file.name}`;
    const previewImage = {
      _tempId: tempId,
      url: previewUrl,
      previewUrl,
      uploading: true,
    };

    setImages(prev => [...prev, previewImage]);

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploading(true);
      const { data } = await api.post('/upload', formData);
      if (data.success) {
        const uploaded = data.data || {};
        if (!uploaded.url && !uploaded.originalUrl && !uploaded.secure_url) {
          throw new Error('Upload completed but image URL was missing');
        }

        const newImage = {
          public_id: uploaded.public_id,
          url: uploaded.url || uploaded.originalUrl || uploaded.secure_url,
        };
        setImages(prev => {
          return prev.map((image) => (
            image._tempId === tempId ? newImage : image
          ));
        });
        URL.revokeObjectURL(previewUrl);
        previewUrlsRef.current.delete(previewUrl);
        toast.success('Image uploaded');
      }
    } catch (error) {
      console.error('Upload error:', error.response?.data || error);
      setImages(prev => prev.filter((image) => image._tempId !== tempId));
      URL.revokeObjectURL(previewUrl);
      previewUrlsRef.current.delete(previewUrl);
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImages(prev => {
      const nextImages = prev.filter((_, i) => i !== index);
      if (prev[index]?.previewUrl) {
        URL.revokeObjectURL(prev[index].previewUrl);
        previewUrlsRef.current.delete(prev[index].previewUrl);
      }
      return nextImages;
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-2 border rounded-xl">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <div className="relative h-24 overflow-hidden rounded-lg bg-gray-100">
              <img
                src={getImageUrl(image)}
                alt={`Preview ${index + 1}`}
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.src = placeholderImage;
                }}
              />
              {image.uploading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/45 text-white">
                  <Loader2 size={22} className="mb-1 animate-spin" />
                  <span className="text-[11px] font-semibold">Uploading</span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all"
            >
              <X size={16} />
            </button>
          </div>
        ))}
        
        <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-300 hover:bg-primary-50 transition-colors">
          <Upload size={24} className="text-gray-400 mb-2" />
          <span className="text-sm text-gray-500">Upload Image</span>
          <input
            type="file"
            onChange={(e) => {
              handleUpload(e.target.files[0]);
              e.target.value = '';
            }}
            className="hidden"
            accept="image/*"
            disabled={uploading}
          />
        </label>
      </div>
      
      {images.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
          <p>No images added yet</p>
        </div>
      )}
      
      {images.length > 0 && (
        <p className="text-sm text-gray-500">
          {images.length} image(s) selected
        </p>
      )}
    </div>
  );
};

export default ImageUploader;

