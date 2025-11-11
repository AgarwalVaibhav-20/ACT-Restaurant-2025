import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Upload, Plus } from 'lucide-react';
import apiService from '../services/api';

export default function AddMenuItem() {
  const { user, restaurantId, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));

      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate form
      if (!formData.name || !formData.price || !formData.category) {
        setError('Name, price, and category are required');
        setIsSubmitting(false);
        return;
      }

      // First, get or create the category (optional)
      // We'll prefer sending the plain category name and only include categoryId when valid
      let categoryId = null;
      try {
        const categoriesResponse = await apiService.getCategories(restaurantId);
        const categories = (categoriesResponse && (categoriesResponse.data || categoriesResponse)) || [];
        
        // Find existing category
        const existingCategory = Array.isArray(categories) && categories.find(
          cat => cat.categoryName?.toLowerCase() === formData.category.toLowerCase()
        );
        
        if (existingCategory) {
          categoryId = existingCategory._id || existingCategory.id || null;
        } else {
          // Do not attempt to create categories on Vercel (file uploads to disk fail).
          // Instead, ask the user to create the category first in the Categories page.
          setError(`Category "${formData.category}" does not exist. Please create it first in Categories.`);
          setIsSubmitting(false);
          return;
        }
      } catch (categoryError) {
        console.error('Category fetch/create failed, proceeding with category name only:', categoryError);
        // Intentionally do NOT set categoryId to a non-ObjectId string to avoid backend cast errors
        categoryId = null;
      }

      // Create FormData for file upload with backend expected field names
      const submitData = new FormData();
      submitData.append('itemName', formData.name);
      submitData.append('price', parseFloat(formData.price));
      submitData.append('description', formData.description);
      // Always send the plain category name for backend compatibility
      submitData.append('category', formData.category);
      // Only include categoryId when it looks like a valid Mongo ObjectId (24 hex chars)
      if (categoryId && /^[a-fA-F0-9]{24}$/.test(String(categoryId))) {
        submitData.append('categoryId', categoryId);
      }
      submitData.append('restaurantId', restaurantId);
      submitData.append('menuId', `menu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
      submitData.append('status', '1'); // Active status
      
      // Include image again; backend now uploads to Cloudinary
      if (formData.image) {
        submitData.append('itemImage', formData.image); // Backend expects 'itemImage'
      }

      // Debug: dump formdata keys
      const dbg = {};
      for (const [k, v] of submitData.entries()) {
        dbg[k] = v instanceof File ? { name: v.name, size: v.size, type: v.type } : v;
      }
      console.log('Submitting menu item (debug formdata):', dbg);

      console.log('Submitting menu item (summary):', {
        name: formData.name,
        price: formData.price,
        category: formData.category,
        restaurantId: restaurantId,
        hasImage: !!formData.image,
        categoryIdUsed: categoryId && /^[a-fA-F0-9]{24}$/.test(String(categoryId)) ? categoryId : null,
      });

      const response = await apiService.createMenuItem(submitData);
      
      console.log('Menu item created:', response);
      // Helpful debug: surface image URL if available
      const createdUrl = response?.data?.itemImage || response?.itemImage || null;
      if (createdUrl) {
        console.log('Created item image URL:', createdUrl);
      }
      setSuccess('Menu item added successfully!');
      
      // Reset form
      setFormData({
        name: '',
        price: '',
        description: '',
        category: '',
        image: null,
      });
      setImagePreview(null);
      
      // Navigate to menu management after a short delay
      setTimeout(() => {
        navigate('/menu-management');
      }, 1500);

    } catch (error) {
      console.error('Error adding menu item:', error);
      setError(error.message || 'Failed to add menu item');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-stone-200">
        <div className="section flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-700 hover:text-stone-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <div className="h-4 w-px bg-stone-300" />
            <h1 className="font-[var(--font-display)] text-xl font-semibold text-stone-900">
              Add Menu Item
            </h1>
          </div>
          <div className="text-sm text-stone-600">
            Restaurant: {user?.username} | ID: {restaurantId}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="section py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Item Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-2">
                  Item Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="e.g., Butter Chicken, Paneer Tikka"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              {/* Price and Category Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-stone-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="e.g., 350"
                    value={formData.price}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-stone-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Category</option>
                    <option value="Starters">Starters</option>
                    <option value="Curries">Curries</option>
                    <option value="Rice">Rice</option>
                    <option value="Breads">Breads</option>
                    <option value="South Indian">South Indian</option>
                    <option value="North Indian">North Indian</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Lentils">Lentils</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-stone-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="Describe your dish... (optional)"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Item Image
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-stone-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    {imagePreview ? (
                      <div className="mb-4">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="mx-auto h-32 w-32 object-cover rounded-lg"
                        />
                      </div>
                    ) : (
                      <Upload className="mx-auto h-12 w-12 text-stone-400" />
                    )}
                    <div className="flex text-sm text-stone-600">
                      <label
                        htmlFor="image"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-brand-600 hover:text-brand-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-500"
                      >
                        <span>{imagePreview ? 'Change image' : 'Upload an image'}</span>
                        <input
                          id="image"
                          name="image"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-stone-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary justify-center flex-1 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-5 w-5" />
                      Add Menu Item
                    </>
                  )}
                </button>
                <Link
                  to="/dashboard"
                  className="btn btn-outline justify-center flex-1"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Tips for adding menu items:</h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Use clear, descriptive names for your dishes</li>
              <li>• Add appetizing descriptions to help customers decide</li>
              <li>• Upload high-quality images to showcase your food</li>
              <li>• Choose appropriate categories for better organization</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}