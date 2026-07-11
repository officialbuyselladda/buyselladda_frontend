import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  IndianRupee,
  LocateFixed,
  MapPin,
  PackagePlus,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ImageUploader from '../components/ImageUploader';
import { useLocation } from '../context/LocationContext';
import { CONDITIONS, CATEGORIES, getCategoryLabel, getCategoryValue, useCategories } from '../utils';
import { getImageUrl } from '../utils/image';
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      price: '',
      category: '',
      subCategory: '',
      condition: '',
      location: '',
    },
  });

  const locationFieldValue = watch('location');
  const selectedCategory = watch('category');
  const previewTitle = watch('title');
  const previewPrice = watch('price');
  const previewCondition = watch('condition');

  const { userLocation, userAddress, loadingLocation, loadingAddress, getLocation } = useLocation();

  const selectedParent = categoryTree.find((category) => (
    getCategoryValue(category) === selectedCategory || getCategoryLabel(category) === selectedCategory
  ));
  const subCategoryOptions = selectedParent?.children || [];
  const previewCategoryLabel = selectedParent ? getCategoryLabel(selectedParent) : '';
  const firstPreviewImage = images.find((image) => image?.url);

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
  }, [categoryOptions, categoryOptionsKey, editProductId, navigate, reset]);

  useEffect(() => {
    if (editProductId) return;
    if (!locationFieldValue && userAddress) {
      setValue('location', userAddress, { shouldValidate: true, shouldDirty: true });
    }
    if (!locationCoords && userLocation) {
      setLocationCoords({ lat: userLocation.lat, lng: userLocation.lng });
    }
  }, [editProductId, locationFieldValue, locationCoords, setValue, userAddress, userLocation]);

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
    } catch {
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
      const category = categoryOptions.find((item) =>
        getCategoryValue(item) === data.category || getCategoryLabel(item) === data.category
      );
      const subCategory = subCategoryOptions.find((item) =>
        getCategoryValue(item) === data.subCategory || getCategoryLabel(item) === data.subCategory
      );

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

  return (
    <>
      <style>{createProductStyles}</style>
      <main className="cp-page">
        <div className="cp-container">
          <button type="button" onClick={() => navigate('/')} className="cp-back">
            <ArrowLeft size={17} />
            Back to home
          </button>

          <section className="cp-hero">
            <div className="cp-hero__icon">
              <PackagePlus size={28} />
            </div>
            <div className="cp-hero__copy">
              <p className="cp-eyebrow">{isEditMode ? 'Update your listing' : 'Sell on BuySellAdda'}</p>
              <h1>{isEditMode ? 'Edit your ad' : 'Post a new ad'}</h1>
              <p>{isEditMode ? 'Refresh your listing details. Edited approved ads go back to review.' : 'Add clear details, photos, price and location so buyers can trust your listing.'}</p>
            </div>
            <div className="cp-hero__steps" aria-label="Posting steps">
              <span><Camera size={14} /> Photos</span>
              <span><Tag size={14} /> Details</span>
              <span><MapPin size={14} /> Location</span>
            </div>
          </section>

          <div className="cp-layout">
            <div className="cp-card cp-form-card">
              {loadingProduct ? (
                <div className="cp-loading">Loading product...</div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="cp-form">
                  <section className="cp-section">
                    <div className="cp-section__head">
                      <span className="cp-section__icon"><Camera size={18} /></span>
                      <div>
                        <h2>Photos</h2>
                        <p>Upload real, clear photos. First photo becomes the cover image.</p>
                      </div>
                    </div>
                    <label className="cp-label">Product images <span className="cp-required">*</span></label>
                    <ImageUploader
                      onImagesChange={setImages}
                      existingImages={initialImages}
                      onUploadingChange={setUploadingImages}
                      maxImages={8}
                      maxSizeMb={5}
                    />
                    {uploadingImages && (
                      <p className="cp-help cp-help--warn">Please wait while images finish uploading before posting your ad.</p>
                    )}
                    <p className="cp-help">Add clear real photos. Max 8 photos, 5MB each.</p>
                  </section>

                  <section className="cp-section">
                    <div className="cp-section__head">
                      <span className="cp-section__icon"><Tag size={18} /></span>
                      <div>
                        <h2>Ad details</h2>
                        <p>Use a direct title and honest description to get better replies.</p>
                      </div>
                    </div>

                    <div className="cp-field">
                      <label className="cp-label">Title <span className="cp-required">*</span></label>
                      <input {...register('title')} className="cp-input" placeholder="e.g. iPhone 14 Pro Max 256GB" />
                      {errors.title && <p className="cp-error">{errors.title.message}</p>}
                    </div>

                    <div className="cp-field">
                      <label className="cp-label">Description <span className="cp-required">*</span></label>
                      <textarea {...register('description')} rows={4} className="cp-input cp-textarea" placeholder="Describe condition, accessories, warranty, defects, and reason for selling..." />
                      {errors.description && <p className="cp-error">{errors.description.message}</p>}
                    </div>

                    <div className="cp-grid">
                      <div className="cp-field">
                        <label className="cp-label">Price (INR) <span className="cp-required">*</span></label>
                        <div className="cp-input-wrap">
                          <IndianRupee size={16} />
                          <input {...register('price')} type="number" className="cp-input cp-input--with-icon" placeholder="5000" />
                        </div>
                        {errors.price && <p className="cp-error">{errors.price.message}</p>}
                      </div>

                      <div className="cp-field">
                        <label className="cp-label">Category <span className="cp-required">*</span></label>
                        <select
                          {...register('category')}
                          onChange={(event) => {
                            setValue('category', event.target.value, { shouldValidate: true });
                            setValue('subCategory', '');
                          }}
                          className="cp-input"
                        >
                          <option value="">Select category</option>
                          {categoryOptions.map((cat) => (
                            <option key={cat._id || getCategoryValue(cat)} value={getCategoryValue(cat)}>
                              {getCategoryLabel(cat)}
                            </option>
                          ))}
                        </select>
                        {errors.category && <p className="cp-error">{errors.category.message}</p>}
                      </div>
                    </div>

                    <div className="cp-field">
                      <label className="cp-label">Sub category</label>
                      <select {...register('subCategory')} className="cp-input" disabled={!subCategoryOptions.length}>
                        <option value="">{subCategoryOptions.length ? 'Select sub category if needed' : 'No sub categories for this category'}</option>
                        {subCategoryOptions.map((cat) => (
                          <option key={`sub-${cat._id || getCategoryValue(cat)}`} value={getCategoryValue(cat)}>
                            {getCategoryLabel(cat)}
                          </option>
                        ))}
                      </select>
                      <p className="cp-help">Only sub categories configured under the selected main category are shown.</p>
                    </div>

                    <div className="cp-grid">
                      <div className="cp-field">
                        <label className="cp-label">Condition <span className="cp-required">*</span></label>
                        <select {...register('condition')} className="cp-input">
                          <option value="">Select condition</option>
                          {CONDITIONS.map((cond) => (
                            <option key={cond} value={cond}>{cond}</option>
                          ))}
                        </select>
                        {errors.condition && <p className="cp-error">{errors.condition.message}</p>}
                      </div>
                    </div>
                  </section>

                  <section className="cp-section">
                    <div className="cp-section__head">
                      <span className="cp-section__icon"><LocateFixed size={18} /></span>
                      <div>
                        <h2>Location</h2>
                        <p>Buyers use location to find nearby listings first.</p>
                      </div>
                    </div>
                    <div className="cp-field">
                      <label className="cp-label">Location <span className="cp-required">*</span></label>
                      <div className="cp-location-card">
                        <div className="cp-location-card__title"><MapPin size={16} /> Current location for this ad</div>
                        <p>{userAddress || 'No current location detected yet. Use the button below to attach your area to the ad.'}</p>
                        {userLocation && (
                          <small>Lat: {userLocation.lat.toFixed(5)}, Lng: {userLocation.lng.toFixed(5)}</small>
                        )}
                      </div>
                      <input {...register('location')} className="cp-input" placeholder="e.g. Mumbai, Maharashtra" />
                      <button
                        type="button"
                        onClick={useExactLocation}
                        disabled={locating || loadingLocation || loadingAddress}
                        className="cp-location-btn"
                      >
                        <LocateFixed size={16} />
                        {locating || loadingLocation || loadingAddress ? 'Detecting location...' : 'Use current location'}
                      </button>
                      {errors.location && <p className="cp-error">{errors.location.message}</p>}
                    </div>
                  </section>

                  <button type="submit" disabled={loading || uploadingImages} className="cp-submit">
                    {loading ? (
                      <span className="cp-submit__loading">
                        <span className="cp-spinner" />
                        {isEditMode ? 'Updating your ad...' : 'Creating your ad...'}
                      </span>
                    ) : (
                      isEditMode ? 'Update ad' : 'Post ad now'
                    )}
                  </button>

                  {(submitStatus || submitError) && (
                    <div className={`cp-status ${submitError ? 'cp-status--error' : 'cp-status--ok'}`}>
                      <div className="cp-status__inner">
                        {!submitError && <CheckCircle2 size={17} />}
                        <span>{submitError || submitStatus}</span>
                      </div>
                    </div>
                  )}
                </form>
              )}
            </div>

            <aside className="cp-side">
              <div className="cp-card cp-preview">
                <p className="cp-side-title">Ad preview</p>
                <div className="cp-preview__image">
                  {firstPreviewImage?.url ? (
                    <img src={getImageUrl(firstPreviewImage)} alt="" />
                  ) : (
                    <Camera size={30} />
                  )}
                </div>
                <div className="cp-preview__body">
                  <strong>{previewPrice ? `Rs ${Number(previewPrice || 0).toLocaleString('en-IN')}` : 'Set your price'}</strong>
                  <span>{previewTitle || 'Your ad title will appear here'}</span>
                  <small>{[previewCategoryLabel, previewCondition].filter(Boolean).join(' | ') || 'Category and condition'}</small>
                </div>
              </div>

              <div className="cp-card cp-tips">
                <p className="cp-side-title">Posting checklist</p>
                <ul>
                  <li><CheckCircle2 size={15} /> Add at least one clear product photo.</li>
                  <li><CheckCircle2 size={15} /> Mention condition, accessories, and reason for selling.</li>
                  <li><CheckCircle2 size={15} /> Use a fair price to get faster buyer replies.</li>
                  <li><ShieldCheck size={15} /> Avoid advance payments outside BuySellAdda chat.</li>
                </ul>
              </div>

              <div className="cp-card cp-user">
                <p className="cp-side-title">Posting as</p>
                <strong>{user?.name || 'Your account'}</strong>
                <span>{user?.email || 'Verified BuySellAdda seller'}</span>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
};

const createProductStyles = `
  .cp-page { min-height: 100vh; background: #f5f4f1; padding: 24px 0 64px; }
  .cp-container { width: 100%; max-width: 1280px; margin: 0 auto; padding: 0 16px; }
  @media (min-width: 640px) { .cp-container { padding: 0 28px; } }
  @media (min-width: 1024px) { .cp-container { padding: 0 44px; } }
  .cp-back { display: inline-flex; align-items: center; gap: 7px; margin-bottom: 16px; border: 0; background: transparent; color: #6b6860; cursor: pointer; font-size: 13px; font-weight: 900; }
  .cp-back:hover { color: #d4571a; }
  .cp-hero { display: flex; align-items: center; gap: 16px; border: 1px solid #edeae5; border-radius: 16px; background: linear-gradient(135deg, #ffffff 0%, #fff8f4 100%); padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.04); margin-bottom: 14px; }
  .cp-hero__icon { width: 58px; height: 58px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border-radius: 16px; background: #fff4ef; border: 1px solid #fddcc8; color: #d4571a; }
  .cp-hero__copy { min-width: 0; flex: 1; }
  .cp-eyebrow { margin: 0 0 4px; color: #d4571a; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.07em; }
  .cp-hero h1 { margin: 0; color: #0f0e0c; font-size: clamp(26px, 4vw, 38px); font-weight: 900; line-height: 1.1; }
  .cp-hero p:not(.cp-eyebrow) { margin: 6px 0 0; max-width: 650px; color: #6b6860; font-size: 14px; font-weight: 650; line-height: 1.5; }
  .cp-hero__steps { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; }
  .cp-hero__steps span { display: inline-flex; align-items: center; gap: 6px; border: 1px solid #edeae5; border-radius: 999px; background: #ffffff; color: #6b6860; padding: 8px 11px; font-size: 12px; font-weight: 900; }
  .cp-layout { display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; }
  @media (min-width: 1040px) { .cp-layout { grid-template-columns: minmax(0, 1fr) 340px; align-items: start; } .cp-side { position: sticky; top: 20px; } }
  .cp-card { border: 1px solid #edeae5; border-radius: 16px; background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.04); }
  .cp-form-card { padding: 18px; }
  .cp-form { display: flex; flex-direction: column; gap: 18px; }
  .cp-section { border: 1px solid #edeae5; border-radius: 14px; background: #fffdf9; padding: 16px; }
  .cp-section__head { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 14px; }
  .cp-section__icon { display: flex; width: 38px; height: 38px; flex-shrink: 0; align-items: center; justify-content: center; border-radius: 12px; background: #fff4ef; color: #d4571a; }
  .cp-section h2 { margin: 0; color: #0f0e0c; font-size: 17px; font-weight: 900; }
  .cp-section p { margin: 3px 0 0; color: #6b6860; font-size: 12.5px; font-weight: 650; line-height: 1.45; }
  .cp-field { margin-top: 14px; }
  .cp-field:first-of-type { margin-top: 0; }
  .cp-label { display: block; margin-bottom: 8px; color: #0f0e0c; font-size: 13px; font-weight: 900; }
  .cp-required { color: #dc2626; }
  .cp-input { width: 100%; min-height: 46px; border: 1px solid #e1ddd6; border-radius: 12px; background: #ffffff; color: #0f0e0c; outline: none; padding: 0 13px; font-size: 14px; font-weight: 700; transition: border-color 0.16s ease, box-shadow 0.16s ease; }
  .cp-input:focus { border-color: #d4571a; box-shadow: 0 0 0 3px rgba(212,87,26,0.10); }
  .cp-input:disabled { opacity: 0.7; cursor: not-allowed; background: #faf9f7; }
  .cp-input-wrap { position: relative; }
  .cp-input-wrap svg { position: absolute; left: 13px; top: 50%; color: #d4571a; transform: translateY(-50%); }
  .cp-input--with-icon { padding-left: 38px; }
  .cp-textarea { min-height: 132px; resize: vertical; padding-top: 13px; line-height: 1.55; }
  .cp-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
  @media (min-width: 720px) { .cp-grid { grid-template-columns: repeat(2, minmax(0,1fr)); } }
  .cp-help { margin-top: 8px; color: #9c9890; font-size: 12px; font-weight: 700; }
  .cp-help--warn { color: #b45309; }
  .cp-error { margin-top: 6px; color: #dc2626; font-size: 12px; font-weight: 800; }
  .cp-location-card { border: 1px solid #bbf7d0; border-radius: 14px; background: #f0fdf4; padding: 13px; margin-bottom: 12px; color: #166534; }
  .cp-location-card__title { display: flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 900; }
  .cp-location-card p { margin: 8px 0 0; color: #166534; font-size: 12.5px; font-weight: 650; line-height: 1.45; }
  .cp-location-card small { display: block; margin-top: 8px; color: #15803d; font-size: 11px; font-weight: 800; }
  .cp-location-btn { display: inline-flex; align-items: center; gap: 7px; margin-top: 9px; border: 0; background: transparent; color: #15803d; cursor: pointer; font-size: 13px; font-weight: 900; }
  .cp-location-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .cp-submit { display: flex; width: 100%; min-height: 52px; align-items: center; justify-content: center; border: 0; border-radius: 13px; background: #d4571a; color: #ffffff; cursor: pointer; font-size: 15px; font-weight: 900; box-shadow: 0 10px 24px rgba(212,87,26,0.22); }
  .cp-submit:hover:not(:disabled) { background: #b84816; }
  .cp-submit:disabled { opacity: 0.58; cursor: not-allowed; }
  .cp-submit__loading { display: inline-flex; align-items: center; gap: 9px; }
  .cp-spinner { width: 22px; height: 22px; border: 2px solid rgba(255,255,255,0.55); border-top-color: #ffffff; border-radius: 50%; animation: cp-spin 0.8s linear infinite; }
  @keyframes cp-spin { to { transform: rotate(360deg); } }
  .cp-status { border-radius: 14px; padding: 13px; font-size: 13px; font-weight: 800; }
  .cp-status--ok { border: 1px solid #bbf7d0; background: #f0fdf4; color: #166534; }
  .cp-status--error { border: 1px solid #fecaca; background: #fff1f1; color: #b91c1c; }
  .cp-status__inner { display: flex; align-items: center; gap: 8px; }
  .cp-side { display: flex; flex-direction: column; gap: 14px; }
  .cp-side-title { margin: 0 0 12px; color: #9c9890; font-size: 11px; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; }
  .cp-preview, .cp-tips, .cp-user { padding: 16px; }
  .cp-preview__image { display: flex; align-items: center; justify-content: center; overflow: hidden; aspect-ratio: 4 / 3; border-radius: 13px; background: #faf9f7; color: #d4571a; border: 1px solid #edeae5; }
  .cp-preview__image img { width: 100%; height: 100%; object-fit: contain; display: block; }
  .cp-preview__body { display: flex; flex-direction: column; gap: 5px; margin-top: 12px; }
  .cp-preview__body strong { color: #d4571a; font-size: 20px; font-weight: 900; }
  .cp-preview__body span { color: #0f0e0c; font-size: 14px; font-weight: 850; line-height: 1.35; }
  .cp-preview__body small { color: #9c9890; font-size: 12px; font-weight: 750; }
  .cp-tips ul { display: flex; flex-direction: column; gap: 10px; margin: 0; padding: 0; list-style: none; }
  .cp-tips li { display: flex; align-items: flex-start; gap: 8px; color: #6b6860; font-size: 12.5px; font-weight: 700; line-height: 1.45; }
  .cp-tips svg { flex-shrink: 0; color: #1a7a4a; margin-top: 1px; }
  .cp-user strong { display: block; color: #0f0e0c; font-size: 15px; font-weight: 900; }
  .cp-user span { display: block; margin-top: 4px; color: #6b6860; font-size: 12px; font-weight: 700; word-break: break-word; }
  .cp-loading { padding: 70px 20px; text-align: center; color: #6b6860; font-weight: 800; }
  @media (max-width: 720px) {
    .cp-page { padding-top: 16px; }
    .cp-hero { align-items: flex-start; flex-direction: column; padding: 16px; }
    .cp-hero__steps { justify-content: flex-start; }
    .cp-form-card { padding: 12px; }
    .cp-section { padding: 13px; }
  }
`;

export default CreateProduct;
