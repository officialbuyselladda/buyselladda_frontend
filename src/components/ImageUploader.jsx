import { useEffect, useRef, useState } from 'react';
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { getImageUrl, placeholderImage } from '../utils/image';

const ImageUploader = ({ onImagesChange, existingImages = [], onUploadingChange = () => {}, maxImages = 8, maxSizeMb = 5 }) => {
  const [uploadingCount, setUploadingCount] = useState(0);
  const uploading = uploadingCount > 0;
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

  useEffect(() => {
    onUploadingChange(uploading);
  }, [uploading, onUploadingChange]);

  const handleUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (images.length >= maxImages) {
      toast.error(`You can add up to ${maxImages} photos`);
      return;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      toast.error(`${file.name} is larger than ${maxSizeMb}MB`);
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
    setUploadingCount((c) => c + 1);

    const formData = new FormData();
    formData.append('image', file);

    try {
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
        setImages(prev => prev.map((image) => (
          image._tempId === tempId ? newImage : image
        )));
        URL.revokeObjectURL(previewUrl);
        previewUrlsRef.current.delete(previewUrl);
        toast.success('Image uploaded');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error.response?.data || error);
      setImages(prev => prev.filter((image) => image._tempId !== tempId));
      URL.revokeObjectURL(previewUrl);
      previewUrlsRef.current.delete(previewUrl);
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploadingCount((c) => Math.max(0, c - 1));
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
          <div key={image._tempId || image.public_id || image.url || index} className="relative group">
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
        
        <label className={`flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-lg transition-colors ${images.length >= maxImages ? 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-60' : 'cursor-pointer border-gray-300 hover:border-primary-300 hover:bg-primary-50'}`}>
          <Upload size={24} className="text-gray-400 mb-2" />
          <span className="text-sm text-gray-500">{images.length >= maxImages ? 'Limit reached' : 'Upload Image'}</span>
          <input
            type="file"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              const remainingSlots = Math.max(maxImages - images.length, 0);
              files.slice(0, remainingSlots).forEach((file) => handleUpload(file));
              if (files.length > remainingSlots) toast.error(`Only ${maxImages} photos are allowed for one ad`);
              e.target.value = '';
            }}
            className="hidden"
            accept="image/*"
            disabled={uploading || images.length >= maxImages}
            multiple
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
          {images.length}/{maxImages} image(s) selected. Max {maxSizeMb}MB each.
          {uploading && <span className="ml-2 font-semibold text-amber-600">Uploading {uploadingCount}...</span>}
        </p>
      )}
    </div>
  );
};

export default ImageUploader;
