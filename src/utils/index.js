import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

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

