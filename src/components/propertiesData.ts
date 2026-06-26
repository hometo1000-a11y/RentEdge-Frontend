'use client';

export interface Property {
  id: string;
  title: string;
  type: string;
  city: string;
  area: string;
  price: number; // Monthly rent
  rent: number; // For compatibility
  depositMonths: number;
  deposit: number; // For compatibility
  rentScoreRequired: number;
  beds: number;
  bhk: number;
  baths: number;
  sqft: number;
  images: string[];
  image: string; // For compatibility
  location: string; // For compatibility
  tag: string; // For compatibility
  tags?: string[];
  amenities: string[];
  description: string;
  ownerName: string;
  ownerPhoneMasked: string;
  ownerPhoneFull: string;
  property_code?: string;
  property_type?: string;
  property_name?: string;
  occupancy_type?: string;
  status?: string;
  address?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  contacts?: { contact_name: string; contact_role: string; contact_phone: string; contact_email?: string }[];
  payment_info?: { account_holder_name?: string; bank_account_number?: string; ifsc_code?: string; upi_id?: string };
  is_city_pioneer?: boolean;
  details?: any;
}

export const mockProperties: Property[] = [];

export const getSmartTags = (property: Property): string[] => {
  const tags: string[] = [];
  if (!property.details?.classificationAnswers) return tags;
  
  const ca = property.details.classificationAnswers;
  
  // Prioritize Transit Friendly
  if (ca.nearMetro) tags.push('🚇 Transit Friendly');
  
  // Work Hub
  if (ca.nearITPark) tags.push('💼 Work Hub');
  
  // Student Friendly
  if (ca.nearCollege) tags.push('🎓 Student Friendly');
  
  // Positioning (Luxury > Premium > Budget)
  if (ca.positioning === 'Luxury' || ca.positioning === 'Luxury Living') {
    tags.push('👑 Luxury');
  } else if (ca.positioning === 'Premium' || ca.positioning === 'Premium Living') {
    tags.push('⭐ Premium');
  } else if (ca.positioning === 'Budget Friendly') {
    tags.push('💰 Budget Friendly');
  }
  
  return tags;
};
