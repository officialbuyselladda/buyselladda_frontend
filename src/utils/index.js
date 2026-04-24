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
      return data.data;
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


export const CONDITIONS = ['New', 'Used'];

export const PRODUCT_STATUS = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  suspicious: 'Suspicious'
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

