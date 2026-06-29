import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories/tree');
      return data?.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 min
  });
};

export const CATEGORIES = [
  'Electronics',
  'Vehicles',
  'Property',
  'Jobs',
  'Services',
  'Others'
];

export const flattenCategories = (categories = [], depth = 0, parent = null) => {
  const result = [];
  const walk = (items, level, parentItem) => {
    (items || []).forEach((item) => {
      if (!item) return;
      const normalized = {
        ...item,
        __depth: level,
        __parentName: parentItem?.name || null,
        __parentSlug: parentItem?.slug || null,
      };
      result.push(normalized);
      if (item.children?.length) walk(item.children, level + 1, item);
    });
  };
  walk(categories, depth, parent);
  return result;
};

export const getCategoryValue = (category) => category?.slug || category?.name || category;
export const getCategoryLabel = (category) => category?.name || category;
export const getCategoryOptionLabel = (category) => {
  const label = getCategoryLabel(category);
  return category?.__depth > 0 && category?.__parentName ? `${category.__parentName} / ${label}` : label;
};

export const useCategoryOptions = () => {
  const query = useCategories();
  const dynamicCategories = flattenCategories(query.data || []);
  const options = dynamicCategories.length ? dynamicCategories : CATEGORIES;
  return { ...query, tree: query.data || [], options };
};


export const CONDITIONS = ['New', 'Used'];

export const PRODUCT_STATUS = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  suspicious: 'Suspicious',
  paused: 'Paused',
  sold: 'Sold'
};

export const getLocationFromCache = () => {
  try {
    const cached = localStorage.getItem('userLocation');
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

export const setLocationCache = (locationData) => {
  try {
    localStorage.setItem('userLocation', JSON.stringify(locationData));
  } catch {}
};

export const clearLocationCache = () => {
  try {
    localStorage.removeItem('userLocation');
  } catch {}
};

