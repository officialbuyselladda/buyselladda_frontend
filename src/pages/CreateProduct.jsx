import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, LocateFixed } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useLocation } from '../context/LocationContext';
import * as yup from 'yup';
import ImageUploader from '../components/ImageUploader';
import { CONDITIONS, CATEGORIES, getCategoryLabel, getCategoryValue, useCategories } from '../utils';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const schema = yup.object({
  title: yup.string().min(3).max(100).required('Title is required'),
  description: yup.string().min(10).required('Description is required'),
  price: yup.number().typeError('Enter a valid price').min(1).max(100000000).required('Price is required'),
  category: yup.string().required('Category is required'),
  subCategory: yup.string().nullable(),
  condition: yup.string().required('Condition is required'),
  location: yup.string().min(2).required('Location is required'),
});

const CreateProduct = () => {
  const navigate = useNavigate();
  const { id: editProductId } = useParams();
  const { user } = useAuth();
  const { data: categoryTree = [] } = useCategories();
  const categoryOptions = categoryTree.length ? categoryTree : CATEGORIES;
  const categoryOptionsKey = useMemo(
    () => categoryOptions.map((category) => `${getCategoryValue(category)}:${getCategoryLabel(category)}`).join('|'),
    [categoryOptions]
  );
  const [images, setImages] = useState([]);
  const [initialImages, setInitialImages] = useState([]);
  const [locationCoords, setLocationCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [loadingProduct, setLoadingProduct] = useState(Boolean(editProductId));
  const isEditMode = Boolean(editProductId);

  const { register, handleSubmit, formState: { errors }, setValue, reset, watch } = useForm({
    resolver: yupResolver(schema)
  });
  const locationFieldValue = watch('location');
  const { userLocation, userAddress, loadingLocation, loadingAddress, getLocation } = useLocation();
  const selectedCategory = watch('category');
  const selectedParent = categoryTree.find((category) => (
    getCategoryValue(category) === selectedCategory || getCategoryLabel(category) === selectedCategory
  ));
  const subCategoryOptions = selectedParent?.children || [];

  useEffect(() => {
    if (!editProductId) return;

    const loadProduct = async () => {
      try {
        setLoadingProduct(true);
        const { data } = await api.get(`/products/my-products/${editProductId}`);
        const product = data.data;
        const matchedCategory = categoryOptions.find((category) => (
          getCategoryValue(category) === product.category || getCategoryLabel(category) === product.category
        ));
        reset({
          title: product.title || '',
          description: product.description || '',
          price: product.price || '',
          category: matchedCategory ? getCategoryValue(matchedCategory) : product.category || '',
          subCategory: product.subCategory || '',
          condition: product.condition || 'Used',
          location: product.location || '',
        });
        const safeImages = (product.images || []).filter((image) => image?.url);
        setImages(safeImages);
        setInitialImages(safeImages);
        if (product.locationCoords?.coordinates?.length === 2) {
          setLocationCoords({
            lng: product.locationCoords.coordinates[0],
            lat: product.locationCoords.coordinates[1],
          });
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load product');
        navigate('/my-products');
      } finally {
        setLoadingProduct(false);
      }
    };

    loadProduct();
  }, [categoryOptionsKey, editProductId, navigate, reset]);

  const useExactLocation = async () => {
    setLocating(true);
    try {
      const result = await getLocation({ refresh: true });
      if (result?.location) {
        setLocationCoords({ lat: result.location.lat, lng: result.location.lng });
      }
      const fallbackAddress = result?.location
        ? `${Number(result.location.lat).toFixed(6)}, ${Number(result.location.lng).toFixed(6)}`
        : '';
      const resolvedAddress = result?.address || fallbackAddress;
      if (resolvedAddress) {
        setValue('location', resolvedAddress, {
          shouldValidate: true,
          shouldDirty: true,
        });
        toast.success('Current location added to your ad');
      } else {
        toast.error('Unable to detect location. Please enter it manually.');
      }
    } catch (error) {
      toast.error('Could not get your current location');
    } finally {
      setLocating(false);
    }
  };

const onSubmit = async (data) => {
    try {
      if (images.length === 0) {
        toast.error('Please upload at least one product image');
        return;
      }
      if (images.length > 8) {
        toast.error('You can add up to 8 photos');
        return;
      }
      if (uploadingImages) {
        toast.error('Please wait while images finish uploading');
        return;
      }
      setLoading(true);
      setSubmitError('');
      setSubmitStatus(isEditMode ? 'Preparing updated ad...' : 'Checking posting eligibility...');
      if (!isEditMode) {
        const eligibilityResponse = await api.get('/products/posting-eligibility');
        const eligibility = eligibilityResponse.data?.data || eligibilityResponse.data;
        if (eligibility?.canPost === false) {
          throw new Error(`Posting limit reached. Daily remaining: ${eligibility.daily?.remaining ?? 0}, monthly remaining: ${eligibility.monthly?.remaining ?? 0}.`);
        }
      }
      setSubmitStatus(isEditMode ? 'Sending ad for review...' : 'Creating your ad...');
      const category = categoryOptions.find((item) => getCategoryValue(item) === data.category || getCategoryLabel(item) === data.category);
      const subCategory = subCategoryOptions.find((item) => getCategoryValue(item) === data.subCategory || getCategoryLabel(item) === data.subCategory);
      const productData = {
        ...data,
        price: Number(data.price),
        category: category ? getCategoryValue(category) : data.category,
        subCategory: subCategory ? getCategoryValue(subCategory) : data.subCategory,
        images,
        ...(locationCoords && {
          locationCoords: {
            type: 'Point',
            coordinates: [locationCoords.lng, locationCoords.lat],
          },
        }),
      };
      
      const request = isEditMode
        ? api.put(`/products/${editProductId}`, productData)
        : api.post('/products', productData);
      const { data: response } = await request;
      toast.success(response?.message || (isEditMode ? 'Your ad has been updated and sent for review.' : 'Your ad has been posted and is pending admin approval.'));
      navigate('/my-products');
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to create product';
      setSubmitError(message);
      setSubmitStatus('');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (editProductId) return;
    if (!locationFieldValue && userAddress) {
      setValue('location', userAddress, { shouldValidate: true, shouldDirty: true });
    }
    if (!locationCoords && userLocation) {
      setLocationCoords({ lat: userLocation.lat, lng: userLocation.lng });
    }
  }, [editProductId, locationFieldValue, locationCoords, setValue, userAddress, userLocation]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft size={24} className="mr-2" />
          Back to home
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {loadingProduct ? (
            <div className="py-20 text-center text-gray-500">Loading product...</div>
          ) : (
          <>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isEditMode ? 'Edit Ad' : 'Create New Ad'}
          </h1>
          <p className="text-gray-600 mb-8">
            {isEditMode ? 'Update your product details. Approved ads go back to review after edits.' : 'Fill in the details to post your product'}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Images */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-4">
                Product Images <span className="text-red-500">*</span>
              </label>
              <ImageUploader 
                onImagesChange={setImages} 
                existingImages={initialImages}
                onUploadingChange={setUploadingImages}
                maxImages={8}
                maxSizeMb={5}
              />
              {uploadingImages && (
                <p className="mt-2 text-sm text-amber-600">
                  Please wait while images finish uploading before posting your ad.
                </p>
              )}
              <p className="mt-2 text-xs text-gray-500">Add clear real photos. Max 8 photos, 5MB each.</p>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                {...register('title')}
                className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g. iPhone 14 Pro Max 256GB"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-vertical"
                placeholder="Describe your product in detail..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
            </div>

            {/* Price & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('price')}
                  type="number"
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="5000"
                />
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('category')}
                  onChange={(event) => {
                    setValue('category', event.target.value, { shouldValidate: true });
                    setValue('subCategory', '');
                  }}
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  {categoryOptions.map(cat => (
                    <option key={cat._id || getCategoryValue(cat)} value={getCategoryValue(cat)}>{getCategoryLabel(cat)}</option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
              </div>
            </div>

            {/* Condition & Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Sub Category
              </label>
              <select
                {...register('subCategory')}
                className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select sub category if needed</option>
                {subCategoryOptions.map(cat => (
                  <option key={`sub-${cat._id || getCategoryValue(cat)}`} value={getCategoryValue(cat)}>{getCategoryLabel(cat)}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Only sub categories configured under the selected main category are shown.</p>
            </div>

            {/* Condition & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Condition <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('condition')}
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select condition</option>
                  {CONDITIONS.map(cond => (
                    <option key={cond} value={cond}>{cond}</option>
                  ))}
                </select>
                {errors.condition && <p className="mt-1 text-sm text-red-600">{errors.condition.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900 mb-4">
                  <div className="font-semibold">Current location for this ad</div>
                  <p className="mt-2 text-emerald-800">
                    {userAddress || 'No current location detected yet. Use the button below to attach your area to the ad.'}
                  </p>
                  {userLocation && (
                    <p className="mt-2 text-xs text-emerald-700">Lat: {userLocation.lat.toFixed(5)}, Lng: {userLocation.lng.toFixed(5)}</p>
                  )}
                </div>
                <input
                  {...register('location')}
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g. Mumbai, Maharashtra"
                />
                <button
                  type="button"
                  onClick={useExactLocation}
                  disabled={locating || loadingLocation || loadingAddress}
                  className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 disabled:opacity-60"
                >
                  <LocateFixed size={16} />
                  {locating || loadingLocation || loadingAddress ? 'Detecting location...' : 'Use current location'}
                </button>
                {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || uploadingImages}
              className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-sm text-lg font-semibold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-all duration-300"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isEditMode ? 'Updating your ad...' : 'Creating your ad...'}</span>
                </div>
              ) : (
                isEditMode ? 'Update Ad' : 'Post Ad Now'
              )}
            </button>
            {(submitStatus || submitError) && (
              <div className={`rounded-2xl border p-4 text-sm font-semibold ${submitError ? 'border-red-100 bg-red-50 text-red-700' : 'border-emerald-100 bg-emerald-50 text-emerald-800'}`}>
                <div className="flex items-center gap-2">
                  {!submitError && <CheckCircle2 size={17} />}
                  <span>{submitError || submitStatus}</span>
                </div>
              </div>
            )}
          </form>
          </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateProduct;
