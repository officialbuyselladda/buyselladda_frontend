import { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';
import { uploadApi } from '../services/api';
import toast from 'react-hot-toast';

const ImageUploader = ({ onImagesChange, existingImages = [] }) => {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState(existingImages);

  const handleUpload = async (file) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploading(true);
      const { data } = await uploadApi.post('/upload', formData);
      if (data.success) {
        const newImage = { public_id: data.data.public_id, url: data.data.url };
        setImages(prev => [...prev, newImage]);
        onImagesChange([...images, newImage]);
        toast.success('Image uploaded');
      }
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-2 border rounded-xl">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <img 
              src={image.url} 
              alt={`Preview ${index + 1}`}
              className="w-full h-24 object-cover rounded-lg"
            />
            <button
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
            onChange={(e) => handleUpload(e.target.files[0])}
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

