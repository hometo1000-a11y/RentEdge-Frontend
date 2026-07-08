'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Plus, Edit2, Trash2, MapPin, Settings,
  BedDouble, IndianRupee, Image as ImageIcon, 
  X, CheckCircle2, ChevronRight, ChevronLeft, Upload, Loader2, Sparkles, Users,
  Copy, Hash, Wallet, AlertTriangle, Mail, Phone
} from 'lucide-react';
import { IKContext, IKUpload } from 'imagekitio-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { api } from './api';
import SearchableSelect from './SearchableSelect';
import PropertyCard from './PropertyCard';
import PropertyDetailsDrawer from './PropertyDetailsDrawer';
import { Property, getSmartTags } from './propertiesData';
import indiaStatesCities from '../data/indiaStatesCities.json';

function SortableImage({ img, index, onRemove, onSetCover }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: img.id || img.imagekit_file_id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm group cursor-grab active:cursor-grabbing touch-manipulation bg-white">
      <img src={img.thumbnail_url} className="w-full h-full object-cover pointer-events-none" alt="Property" />
      {img.is_cover && (
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-brand-purple text-white text-[9px] font-black uppercase tracking-wider rounded z-10 shadow-sm flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Cover
        </div>
      )}
      
      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
        {!img.is_cover && (
          <button 
            type="button"
            onPointerDown={(e) => { e.stopPropagation(); onSetCover(); }}
            className="px-3 py-1 bg-white text-brand-purple text-[10px] font-black uppercase tracking-wider rounded-md shadow-md hover:bg-slate-50 transition-colors"
          >
            Set Cover
          </button>
        )}
        <button 
          type="button"
          onPointerDown={(e) => { e.stopPropagation(); onRemove(); }}
          className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/60 text-white text-[10px] font-bold rounded z-10 backdrop-blur-sm pointer-events-none">
        {index + 1}
      </div>


    </div>
  );
}

const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;

const authenticator = async () => {
  try {
    const response = await api.getImageKitAuth();
    return response;
  } catch (error) {
    throw new Error(`Authentication request failed: ${error}`);
  }
};

const STATE_CITY_MAP: Record<string, string[]> = indiaStatesCities;

const INITIAL_FORM_DATA = {
  property_name: '',
  property_type: 'Apartment',
  short_description: '',
  full_description: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  locality: '',
  landmark: '',
  rent_amount: '',
  deposit_amount: '',
  maintenance_amount: '0',
  occupancy_type: 'Any',
  details: {
    // Apartment / House / Villa
    bhk: '1',
    bathrooms: '1',
    apartment_floor_on: '',
    built_up_area: '',
    plot_area: '',
    parking_spaces: '0',
    // PG
    sharing_types: [] as string[],
    food_option: 'WITHOUT_FOOD' as 'WITH_FOOD' | 'WITHOUT_FOOD' | 'BOTH',
    rent_with_food: '',
    rent_without_food: '',
    attached_washroom: false,
    // Commercial
    office: false,
    shop: false,
    warehouse: false,
    commercial_area: '',
    // Villa specific
    rental_model: 'MONTHLY_ONLY' as 'MONTHLY_ONLY' | 'DAILY_ONLY' | 'BOTH',
    daily_rent: ''
  },
  images: [] as any[],
  tags: [] as string[],
  contacts: [] as any[],
  amenities: [] as string[],
  highlights: [] as string[],
  classificationAnswers: {
    // High-value Smart Tags
    nearMetro: false,
    nearITPark: false,
    nearCollege: false,
    // Property Quality
    furnishing: 'Unfurnished',
    positioning: 'Budget Friendly',
  }
};


export default function PropertyManagement() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [paymentGateOpen, setPaymentGateOpen] = useState(false);
  const [viewingProperty, setViewingProperty] = useState<any>(null);
  const [sessionId, setSessionId] = useState(() => `property_wizard_${Math.random().toString(36).substr(2, 9)}`);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [createdProperty, setCreatedProperty] = useState<any>(null);

  const copyPropertyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  // Wizard Form State
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const data = await api.getProperties();
      setProperties(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  // Draft Protection & Recovery
  useEffect(() => {
    if (isWizardOpen && !editingPropertyId) {
      const draft = localStorage.getItem('Homtu_property_draft');
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          if (window.confirm('You have an unsaved property draft. Do you want to restore it?')) {
            setFormData(parsed.formData);
            setWizardStep(parsed.wizardStep || 1);
          } else {
            localStorage.removeItem('Homtu_property_draft');
          }
        } catch(e) {}
      }
    }
  }, [isWizardOpen, editingPropertyId]);

  useEffect(() => {
    if (isWizardOpen && !editingPropertyId) {
      localStorage.setItem('Homtu_property_draft', JSON.stringify({ formData, wizardStep }));
    }
  }, [formData, wizardStep, isWizardOpen, editingPropertyId]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isWizardOpen && !editingPropertyId) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isWizardOpen, editingPropertyId]);

  // Owner Auto-fill
  useEffect(() => {
    if (isWizardOpen && !editingPropertyId && formData.contacts.length === 0) {
      api.getMe().then((user: any) => {
        setFormData(prev => ({
          ...prev,
          contacts: [{
            role: 'Owner',
            name: user.full_name || user.fullName || user.name || localStorage.getItem('Homtu_user_fullname') || '',
            phone: user.phone || '',
            email: user.email || localStorage.getItem('Homtu_user_email') || '',
            notes: ''
          }]
        }));
      }).catch(() => {
        setFormData(prev => ({
          ...prev,
          contacts: [{
            role: 'Owner',
            name: localStorage.getItem('Homtu_user_fullname') || '',
            phone: '',
            email: localStorage.getItem('Homtu_user_email') || '',
            notes: ''
          }]
        }));
      });
    }
  }, [isWizardOpen, editingPropertyId, formData.contacts.length]);

  const totalProps = properties.length;

  const validateStep = (step: number) => {
    if (step === 1) {
      if (!formData.property_name) return 'Property Name is required';
      if (!formData.property_type) return 'Property Type is required';
      if (!formData.state) return 'State is required';
      if (!formData.city) return 'City is required';
      if (!formData.address) return 'Address is required';
    }
    if (step === 2) {
      if (formData.property_type !== 'PG') {
        if (formData.property_type === 'Villa') {
          if (['MONTHLY_ONLY', 'BOTH'].includes(formData.details.rental_model) && !formData.rent_amount) return 'Monthly Rent is required';
          if (['DAILY_ONLY', 'BOTH'].includes(formData.details.rental_model) && !formData.details.daily_rent) return 'Daily Rent is required';
        } else {
          if (!formData.rent_amount) return 'Monthly Rent is required';
        }
      }
      if (['Apartment', 'House', 'Villa'].includes(formData.property_type)) {
        if (!formData.details.bhk) return 'BHK is required for ' + formData.property_type;
        if (!formData.details.bathrooms || Number(formData.details.bathrooms) < 1) return 'Number of Bathrooms is required';
        if (formData.property_type === 'Apartment' && !formData.details.apartment_floor_on) return 'Floor Number is required for Apartment';
      }
      if (formData.property_type === 'PG') {
        if (!formData.details.sharing_types || formData.details.sharing_types.length === 0) return 'At least one sharing type is required for PG';
        if (['WITH_FOOD', 'BOTH'].includes(formData.details.food_option) && !formData.details.rent_with_food) return 'Rent with food is required';
        if (['WITHOUT_FOOD', 'BOTH'].includes(formData.details.food_option) && !formData.details.rent_without_food) return 'Rent without food is required';
      }
    }
    if (step === 3) {
      if (!formData.short_description || formData.short_description.length < 10) return 'Short description is required (min 10 chars)';
      if (!formData.full_description || formData.full_description.length < 20) return 'Full description is required (min 20 chars)';
      if (formData.images.length === 0) return 'At least one property image is required';
    }
    if (step === 6) {
      if (formData.contacts.length === 0) return 'At least one contact is required';
      for (const c of formData.contacts) {
        if (!c.role) return 'Contact Type is required for all contacts';
        if (!c.name) return 'Name is required for all contacts';
        if (!c.phone || c.phone.length < 10) return `Valid phone number is required for contact: ${c.name || 'Unknown'}`;
      }
      const phones = formData.contacts.map(c => c.phone);
      if (new Set(phones).size !== phones.length) return 'Duplicate phone numbers are not allowed in contacts';
    }
    return null;
  };


  const handleNextStep = () => {
    const error = validateStep(wizardStep);
    if (error) {
      setValidationError(error);
      setTimeout(() => setValidationError(null), 4000);
      return;
    }
    if (wizardStep === 5) generateTags();
    setWizardStep(prev => Math.min(prev + 1, 7));
  };
  const handlePrevStep = () => setWizardStep(prev => Math.max(prev - 1, 1));

  const generateTags = () => {
    const newTags: string[] = [];
    const ans = formData.classificationAnswers as any;
    
    // Location
    if (ans.nearMetro) newTags.push('Near Metro');
    if (ans.nearITPark) newTags.push('Tech Hub');
    if (ans.nearCollege) newTags.push('Student Friendly');

    // Legacy support from occupancy
    if (formData.occupancy_type === 'Family Only') newTags.push('Family Friendly');
    if (formData.occupancy_type === 'Bachelors Only') newTags.push('Bachelors');

    // Property Quality
    if (ans.furnishing && ans.furnishing !== 'Unfurnished') newTags.push(ans.furnishing);
    if (ans.positioning) newTags.push(ans.positioning);

    // PG specific (deprecated)

    const uniqueTags = Array.from(new Set(newTags));
    
    setFormData({ 
      ...formData, 
      tags: uniqueTags,
    });
  };

  const validateFile = (file: File) => {
    if (formData.images.length >= 30) {
      alert("Maximum 30 images allowed per property");
      return false;
    }
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/avif'];
    if (!validTypes.includes(file.type)) {
      alert(`Invalid file type: ${file.name}. Only jpg, png, webp, heic, and avif are supported.`);
      return false;
    }
    return true;
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFormData((prev) => {
        const oldIndex = prev.images.findIndex(img => (img.id || img.imagekit_file_id) === active.id);
        const newIndex = prev.images.findIndex(img => (img.id || img.imagekit_file_id) === over.id);
        
        const newImages = arrayMove(prev.images, oldIndex, newIndex);
        const reorderedImages = newImages.map((img, index) => ({ ...img, display_order: index }));
        
        if (editingPropertyId) {
          const orderPayload = reorderedImages
            .filter(img => img.id)
            .map(img => ({ id: img.id, display_order: img.display_order }));
            
          if (orderPayload.length > 0) {
            api.reorderImages(editingPropertyId, orderPayload).catch(err => console.error("Reorder fail", err));
          }
        }
        return { ...prev, images: reorderedImages };
      });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleSetCover = async (index: number) => {
    const img = formData.images[index];
    if (editingPropertyId && img.id) {
      try {
        await api.setCoverImage(editingPropertyId, img.id);
      } catch (err) {
        console.error(err);
        return alert("Failed to set cover");
      }
    }
    setFormData(prev => {
      const newImages = prev.images.map((i, idx) => ({ ...i, is_cover: idx === index }));
      return { ...prev, images: newImages };
    });
  };

  const handleDeleteImage = async (index: number) => {
    const img = formData.images[index];
    try {
      if (editingPropertyId && img.id) {
        await api.deletePropertyImage(editingPropertyId, img.id);
      } else {
        await api.deleteTempUpload(img.imagekit_file_id);
      }
      setFormData(prev => {
        let newImages = prev.images.filter((_, idx) => idx !== index);
        if (img.is_cover && newImages.length > 0) {
          newImages[0].is_cover = true;
        }
        return { ...prev, images: newImages };
      });
    } catch (err) {
      console.error(err);
      alert("Failed to delete image");
    }
  };
  const getPGPrice = (p: any) => {
    if (p.property_type === 'PG') {
      const foodOption = p.details?.food_option;
      const withFood = Number(p.details?.rent_with_food) || 0;
      const withoutFood = Number(p.details?.rent_without_food) || 0;
      if (foodOption === 'WITHOUT_FOOD' && withoutFood) return withoutFood;
      if (foodOption === 'WITH_FOOD' && withFood) return withFood;
      if (foodOption === 'BOTH' && withFood && withoutFood) return Math.min(withFood, withoutFood);
      return p.rent_amount || 0;
    }
    return p.rent_amount || 0;
  };

  const handleEdit = (property: any) => {
    setFormData({
      property_name: property.property_name || '',
      property_type: property.property_type || 'Apartment',
      short_description: property.short_description || '',
      full_description: property.full_description || '',
      address: property.address || '',
      city: property.city || '',
      state: property.state || '',
      pincode: property.pincode || '',
      locality: property.locality || '',
      landmark: property.landmark || '',
      rent_amount: property.rent_amount?.toString() || '',
      deposit_amount: property.deposit_amount?.toString() || '',
      maintenance_amount: property.maintenance_amount?.toString() || '0',
      occupancy_type: property.occupancy_type || 'Any',
      details: {
        // Apt/House/Villa
        bhk: property.details?.bhk?.toString() || '1',
        bathrooms: property.details?.bathrooms?.toString() || '1',
        apartment_floor_on: property.details?.apartment_floor_on?.toString() || '',
        built_up_area: property.details?.built_up_area?.toString() || '',
        plot_area: property.details?.plot_area?.toString() || '',
        parking_spaces: property.details?.parking_spaces?.toString() || '0',
        // PG
        sharing_types: property.details?.sharing_types || [],
        food_option: property.details?.food_option || 'WITHOUT_FOOD',
        rent_with_food: property.details?.rent_with_food?.toString() || '',
        rent_without_food: property.details?.rent_without_food?.toString() || '',
        attached_washroom: property.details?.attached_washroom || false,
        // Commercial
        office: property.details?.office || false,
        shop: property.details?.shop || false,
        warehouse: property.details?.warehouse || false,
        commercial_area: property.details?.commercial_area?.toString() || '',
        // Villa
        rental_model: property.details?.rental_model || 'MONTHLY_ONLY',
        daily_rent: property.details?.daily_rent?.toString() || ''
      },
      images: property.images || [],
      tags: property.tags?.map((t:any) => t.tag_name) || [],
      contacts: property.contacts || [],
      amenities: property.amenities?.map((a:any) => a.amenity_name) || [],
      highlights: property.highlights?.map((h:any) => h.highlight_text) || [],
      classificationAnswers: {
        nearMetro: property.details?.classificationAnswers?.nearMetro ?? (property.tags?.some((t:any) => t.tag_name === 'Near Metro') || false),
        nearITPark: property.details?.classificationAnswers?.nearITPark ?? (property.tags?.some((t:any) => t.tag_name === 'Tech Hub') || false),
        nearCollege: property.details?.classificationAnswers?.nearCollege ?? (property.tags?.some((t:any) => t.tag_name === 'Student Friendly') || false),
        furnishing: property.details?.classificationAnswers?.furnishing || 'Unfurnished',
        positioning: property.details?.classificationAnswers?.positioning || 'Budget Friendly',
      }
    });
    setEditingPropertyId(property.id);
    setWizardStep(1);
    setIsWizardOpen(true);
    setSessionId(`property_wizard_${Math.random().toString(36).substr(2, 9)}`);
  };


  const handleFileUpload = async (event: any) => {
    const files = Array.from(event.target.files) as File[];
    if (files.length === 0) return;
    
    if (formData.images.length + files.length > 30) {
      return alert("Maximum 30 images allowed per property");
    }

    try {
      const uploadPromises = files.map(async (file) => {
        if (!validateFile(file)) return null;
        
        // Generate fresh authentication for EACH file
        const auth = await authenticator();
        
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);
        formDataUpload.append("fileName", file.name);
        formDataUpload.append("folder", "/temp_uploads");
        formDataUpload.append("publicKey", publicKey!);
        formDataUpload.append("signature", auth.signature);
        formDataUpload.append("expire", auth.expire.toString());
        formDataUpload.append("token", auth.token);
        formDataUpload.append("useUniqueFileName", "true");

        const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
          method: "POST",
          body: formDataUpload
        });
        
        if (!response.ok) {
          const errorBody = await response.text();
          console.error("Upload failed for file:", file.name, {
            status: response.status,
            body: errorBody
          });
          return null;
        }
        return response.json();
      });

      const results = await Promise.all(uploadPromises);
      const validResults = results.filter(r => r !== null);
      
      for (const res of validResults) {
        await api.saveTempUpload({
          session_id: sessionId,
          imagekit_file_id: res.fileId,
          image_url: res.url
        });
      }

      setFormData(prev => {
        const newImages = validResults.map((res, idx) => ({
          imagekit_file_id: res.fileId,
          image_url: res.url,
          thumbnail_url: res.thumbnailUrl,
          is_cover: prev.images.length === 0 && idx === 0,
          display_order: prev.images.length + idx,
          id: res.fileId
        }));
        return { ...prev, images: [...prev.images, ...newImages] };
      });
    } catch (err) {
      console.error(err);
      alert("Failed to process uploads");
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setCreatedProperty(null);
    const paymentInfo = await api.getPaymentInfo().catch(() => ({ exists: false }));
    if (!paymentInfo.exists) {
      setPaymentGateOpen(true);
      setSubmitting(false);
      return;
    }
    // Build a type-specific details payload — no dead fields.
    const buildTypedDetails = () => {
      const ca = formData.classificationAnswers;
      const base = { classificationAnswers: ca };
      const pt = formData.property_type;
      if (['Apartment', 'House', 'Villa'].includes(pt)) {
        return {
          ...base,
          bhk: Number(formData.details.bhk),
          bathrooms: Number(formData.details.bathrooms),
          built_up_area: formData.details.built_up_area ? Number(formData.details.built_up_area) : undefined,
          ...(pt === 'Apartment' ? { apartment_floor_on: Number(formData.details.apartment_floor_on) } : {}),
          ...(pt !== 'Apartment' ? { plot_area: formData.details.plot_area ? Number(formData.details.plot_area) : undefined } : {}),
          ...(pt === 'Villa' ? { 
            parking_spaces: Number(formData.details.parking_spaces),
            rental_model: formData.details.rental_model,
            daily_rent: ['DAILY_ONLY', 'BOTH'].includes(formData.details.rental_model) && formData.details.daily_rent ? Number(formData.details.daily_rent) : undefined
          } : {}),
        };
      }
      if (pt === 'PG') {
        const pgDetails: any = {
          ...base,
          sharing_types: formData.details.sharing_types,
          food_option: formData.details.food_option,
          attached_washroom: formData.details.attached_washroom,
        };
        if (['WITH_FOOD', 'BOTH'].includes(formData.details.food_option)) {
          pgDetails.rent_with_food = formData.details.rent_with_food ? Number(formData.details.rent_with_food) : undefined;
        }
        if (['WITHOUT_FOOD', 'BOTH'].includes(formData.details.food_option)) {
          pgDetails.rent_without_food = formData.details.rent_without_food ? Number(formData.details.rent_without_food) : undefined;
        }
        return pgDetails;
      }
      if (pt === 'Commercial') {
        return {
          ...base,
          commercial_area: formData.details.commercial_area ? Number(formData.details.commercial_area) : undefined,
          office: formData.details.office,
          shop: formData.details.shop,
          warehouse: formData.details.warehouse,
        };
      }
      return base;
    };

    try {
      // Calculate final properties.rent_amount correctly based on the model
      let finalRentAmount = Number(formData.rent_amount);
      if (formData.property_type === 'PG') finalRentAmount = 0;
      if (formData.property_type === 'Villa' && formData.details.rental_model === 'DAILY_ONLY') finalRentAmount = 0; // Or null if DB allowed, but using 0 for safety

      if (editingPropertyId) {
        await api.updateProperty(editingPropertyId, {
          ...formData,
          rent_amount: finalRentAmount,
          details: buildTypedDetails(),
          session_id: sessionId
        });
      } else {
        const created = await api.createProperty({
          ...formData,
          rent_amount: finalRentAmount,
          details: buildTypedDetails(),
          session_id: sessionId
        });
        setCreatedProperty(created);
      }
      
      await loadProperties();
      setIsWizardOpen(false);
      setEditingPropertyId(null);
      setWizardStep(1);
      setFormData(INITIAL_FORM_DATA);
      localStorage.removeItem('Homtu_property_draft');
      setSessionId(`property_wizard_${Math.random().toString(36).substr(2, 9)}`);
      if (!editingPropertyId && createdProperty?.property_code) {
        window.dispatchEvent(new CustomEvent('owner:property-created', { detail: createdProperty }));
      }
    } catch (err) {
      console.error("Failed to save property", err);
    } finally {
      setSubmitting(false);
    }
  };


  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this property?")) {
      try {
        await api.deleteProperty(id);
        await loadProperties();
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  const handleCancel = async () => {
    const tempImages = formData.images.filter((img: any) => !img.id);
    if (tempImages.length > 0) {
      try {
        await api.deleteTempUploads(sessionId);
      } catch (err) {
        console.error("Failed to cleanup temp uploads:", err);
      }
    }
    setIsWizardOpen(false);
    setEditingPropertyId(null);
    setWizardStep(1);
    setFormData(INITIAL_FORM_DATA);
    setCreatedProperty(null);
    localStorage.removeItem('Homtu_property_draft');
    setSessionId(`property_wizard_${Math.random().toString(36).substr(2, 9)}`);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-slate-800 dark:text-white">Property Management</h2>
            <span className="px-2.5 py-1 bg-brand-purple/10 text-brand-purple rounded-lg text-xs font-black">
              {loading ? '-' : totalProps} Total Properties
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">Manage your complete real estate portfolio</p>
        </div>
        <button 
          onClick={() => {
            setEditingPropertyId(null);
            setFormData(INITIAL_FORM_DATA);
            setWizardStep(1);
            setSessionId(`property_wizard_${Math.random().toString(36).substr(2, 9)}`);
            setIsWizardOpen(true);
          }}
          className="bg-brand-purple text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          List New Property
        </button>
      </div>


      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/60 p-12 text-center shadow-xs">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-black text-slate-800">No properties listed yet</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Your property portfolio is currently empty. List your first property to start generating automated lease agreements and tracking collections.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(p => {
            const coverImage = p.images?.find((i:any) => i.is_cover) || p.images?.[0];
            const mappedProperty: Property = {
              id: p.id,
              title: p.property_name,
              type: p.property_type,
              city: p.city,
              area: p.locality || p.city,
              price: getPGPrice(p),
              rent: getPGPrice(p),
              deposit: p.deposit_amount || 0,
              depositMonths: (p.rent_amount && p.deposit_amount) ? Math.round(p.deposit_amount / p.rent_amount) : 0,
              rentScoreRequired: 0,
              beds: p.details?.bhk || 1,
              bhk: p.details?.bhk || 1,
              baths: p.details?.bathrooms || 1,
              sqft: p.details?.built_up_area || p.details?.carpet_area || p.details?.commercial_area || 0,
              images: p.images?.map((i: any) => i.image_url) || [],
              image: coverImage?.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1073&q=80',
              occupancy_type: p.occupancy_type || 'Any',
              property_code: p.property_code,
              description: p.short_description || '',
              location: p.locality || p.city || '',
              tag: p.property_type || '',
              ownerName: p.users ? p.users.full_name : '',
              ownerPhoneMasked: p.users && p.users.phone ? `XXXXXX${p.users.phone.slice(-4)}` : '',
              ownerPhoneFull: p.users && p.users.phone ? p.users.phone : '',
              tags: p.tags?.map((t:any) => t.tag_name) || [],
              amenities: p.amenities?.map((a:any) => a.amenity_name) || [],
              contacts: p.contacts || [],
              details: p.details || {}
            };

            return (
              <PropertyCard 
                key={p.id}
                property={mappedProperty}
                propertyCode={p.property_code}
                onView={async () => {
                  try {
                    const fullProp = await api.getProperty(p.id);
                    const fullCover = fullProp.images?.find((i:any) => i.is_cover) || fullProp.images?.[0];
                    const fullMapped: Property = {
                      id: fullProp.id,
                      title: fullProp.property_name,
                      type: fullProp.property_type,
                      city: fullProp.city,
                      area: fullProp.locality || fullProp.city,
                      price: getPGPrice(fullProp),
                      rent: getPGPrice(fullProp),
                      deposit: fullProp.deposit_amount || 0,
                      depositMonths: (fullProp.rent_amount && fullProp.deposit_amount) ? Math.round(fullProp.deposit_amount / fullProp.rent_amount) : 0,
                      rentScoreRequired: 0,
                      beds: fullProp.details?.bhk || 1,
                      bhk: fullProp.details?.bhk || 1,
                      baths: fullProp.details?.bathrooms || 1,
                      sqft: fullProp.details?.built_up_area || fullProp.details?.carpet_area || fullProp.details?.commercial_area || 0,
                      images: fullProp.images?.map((i: any) => i.image_url) || [],
                      image: fullCover?.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1073&q=80',
                      occupancy_type: fullProp.occupancy_type || 'Any',
                      property_code: fullProp.property_code,
                      description: fullProp.short_description || '',
                      location: fullProp.locality || fullProp.city || '',
                      tag: fullProp.property_type || '',
                      ownerName: fullProp.users ? fullProp.users.full_name : '',
                      ownerPhoneMasked: fullProp.users && fullProp.users.phone ? `XXXXXX${fullProp.users.phone.slice(-4)}` : '',
                      ownerPhoneFull: fullProp.users && fullProp.users.phone ? fullProp.users.phone : '',
                      tags: fullProp.tags?.map((t:any) => t.tag_name) || [],
                      amenities: fullProp.amenities?.map((a:any) => a.amenity_name) || [],
                      contacts: fullProp.contacts || [],
                      details: fullProp.details || {}
                    };
                    setViewingProperty(fullMapped);
                  } catch (err) {
                    console.error('Failed to load property details:', err);
                    setViewingProperty(mappedProperty);
                  }
                }}
                onEdit={() => handleEdit(p)}
                onDelete={() => handleDelete(p.id)}
              />
            );
          })}
        </div>
      )}

      {/* Property Creation Wizard Modal */}
      <AnimatePresence>
        {isWizardOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="font-black text-slate-800 text-lg">{editingPropertyId ? 'Edit Property' : 'Add New Property'}</h3>
                  <p className="text-xs text-slate-500 font-medium">Step {wizardStep} of 7</p>
                </div>
                <button onClick={handleCancel} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-700 shadow-sm border border-slate-100">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-1.5">
                <div className="h-full bg-brand-purple transition-all duration-300" style={{ width: `${(wizardStep / 7) * 100}%` }} />
              </div>
              
              {/* Validation Error Banner */}
              <AnimatePresence>
                {validationError && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-red-50 border-b border-red-100 px-6 py-3 flex items-center justify-between text-red-700 shadow-sm z-10">
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                      {validationError}
                    </div>
                    <button onClick={() => setValidationError(null)} className="p-1 hover:bg-red-100 rounded-md transition-colors"><X className="w-3.5 h-3.5" /></button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Content Body */}
              <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                
                {/* STEP 1: Core Definitions */}
                {wizardStep === 1 && (
                  <div className="space-y-4 animate-fade-in">
                    <h4 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-4">
                      <Building2 className="w-4 h-4 text-brand-purple" />
                      Basic Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="col-span-full">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Property Name</label>
                        <input type="text" value={formData.property_name} onChange={e => setFormData({...formData, property_name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-primary outline-none" placeholder="e.g. Sunrise Apartments" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Property Type</label>
                        <select value={formData.property_type} onChange={e => {
                          const newType = e.target.value;
                          let newOccupancy = formData.occupancy_type;
                          if (['Apartment', 'House', 'Villa'].includes(newType) && !['Any', 'Family Only', 'Bachelors Only'].includes(newOccupancy)) newOccupancy = 'Any';
                          else if (newType === 'PG' && !['Male Only', 'Female Only', 'Co-ed'].includes(newOccupancy)) newOccupancy = 'Co-ed';
                          else if (newType === 'Commercial') newOccupancy = 'Any';
                          setFormData({...formData, property_type: newType, occupancy_type: newOccupancy});
                        }} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-primary outline-none">
                          <option>Apartment</option><option>House</option><option>Villa</option><option>PG</option><option>Commercial</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Occupancy Type</label>
                        <select value={formData.occupancy_type} onChange={e => setFormData({...formData, occupancy_type: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-primary outline-none">
                          {['Apartment', 'House', 'Villa'].includes(formData.property_type) && (
                            <><option>Any</option><option>Family Only</option><option>Bachelors Only</option></>
                          )}
                          {formData.property_type === 'PG' && (
                            <><option>Male Only</option><option>Female Only</option><option>Co-ed</option></>
                          )}
                          {formData.property_type === 'Commercial' && (
                            <option>Any</option>
                          )}
                        </select>
                      </div>
                      <div className="col-span-full">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Address</label>
                        <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium" />
                      </div>
                      <SearchableSelect 
                        label="State"
                        placeholder="Select State"
                        value={formData.state}
                        onChange={v => setFormData({...formData, state: v, city: ''})}
                        options={Object.keys(STATE_CITY_MAP)}
                      />
                      <SearchableSelect 
                        label="City"
                        placeholder="Select City"
                        value={formData.city}
                        onChange={v => setFormData({...formData, city: v})}
                        options={formData.state ? (STATE_CITY_MAP[formData.state] || []) : []}
                        disabled={!formData.state}
                      />
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Locality</label>
                        <input type="text" value={formData.locality} onChange={e => setFormData({...formData, locality: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Landmark</label>
                        <input type="text" value={formData.landmark} onChange={e => setFormData({...formData, landmark: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Pincode</label>
                        <input type="text" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium" />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Property Specifics */}
                {wizardStep === 2 && (
                  <div className="space-y-6 animate-fade-in">
                    <h4 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-4">
                      <Settings className="w-4 h-4 text-brand-purple" />
                      Property Specifics
                    </h4>

                    {/* Financials */}
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl mb-4">
                      <h5 className="text-[10px] uppercase font-bold text-slate-400 mb-3">Financial Details</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {formData.property_type === 'Villa' && (
                          <div className="col-span-full mb-2">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Rental Model <span className="text-red-500">*</span></label>
                            <div className="flex gap-3">
                              {[{val: 'MONTHLY_ONLY', label: 'Monthly Only'}, {val: 'DAILY_ONLY', label: 'Daily Only'}, {val: 'BOTH', label: 'Both Options'}].map(opt => (
                                <label key={opt.val} className={`flex items-center gap-2 text-sm font-bold px-4 py-2 border rounded-lg cursor-pointer transition-colors ${
                                  formData.details.rental_model === opt.val ? 'bg-brand-purple text-white border-brand-purple' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-purple/40'
                                }`}>
                                  <input type="radio" name="rental_model" value={opt.val}
                                    checked={formData.details.rental_model === opt.val}
                                    onChange={() => setFormData({...formData, details: {...formData.details, rental_model: opt.val as any}})}
                                    className="hidden"
                                  />
                                  {opt.label}
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {formData.property_type !== 'PG' && (
                          <>
                            {(formData.property_type !== 'Villa' || ['MONTHLY_ONLY', 'BOTH'].includes(formData.details.rental_model)) && (
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Monthly Rent</label>
                                <input type="number" value={formData.rent_amount} onChange={e => setFormData({...formData, rent_amount: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium" />
                              </div>
                            )}
                            {(formData.property_type === 'Villa' && ['DAILY_ONLY', 'BOTH'].includes(formData.details.rental_model)) && (
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Daily Rent</label>
                                <input type="number" value={formData.details.daily_rent} onChange={e => setFormData({...formData, details: {...formData.details, daily_rent: e.target.value}})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium" />
                              </div>
                            )}
                          </>
                        )}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Security Deposit</label>
                          <input type="number" value={formData.deposit_amount} onChange={e => setFormData({...formData, deposit_amount: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Maintenance</label>
                          <input type="number" value={formData.maintenance_amount} onChange={e => setFormData({...formData, maintenance_amount: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium" />
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Fields */}
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                      <h5 className="text-[10px] uppercase font-bold text-slate-400 mb-3">{formData.property_type} Details</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['Apartment', 'House', 'Villa'].includes(formData.property_type) && (
                          <>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">BHK <span className="text-red-500">*</span></label>
                              <input type="number" min="1" value={formData.details.bhk} onChange={e => setFormData({...formData, details: {...formData.details, bhk: e.target.value}})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Bathrooms <span className="text-red-500">*</span></label>
                              <input type="number" min="1" value={formData.details.bathrooms} onChange={e => setFormData({...formData, details: {...formData.details, bathrooms: e.target.value}})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Built-up Area (sqft)</label>
                              <input type="number" value={formData.details.built_up_area} onChange={e => setFormData({...formData, details: {...formData.details, built_up_area: e.target.value}})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium" />
                            </div>
                          </>
                        )}

                        {formData.property_type === 'Apartment' && (
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Apartment Floor On <span className="text-red-500">*</span></label>
                            <input type="number" required value={formData.details.apartment_floor_on} onChange={e => setFormData({...formData, details: {...formData.details, apartment_floor_on: e.target.value}})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium" />
                          </div>
                        )}
                        {['House', 'Villa'].includes(formData.property_type) && (
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Plot Area (sqft)</label>
                            <input type="number" value={formData.details.plot_area} onChange={e => setFormData({...formData, details: {...formData.details, plot_area: e.target.value}})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium" />
                          </div>
                        )}
                        {formData.property_type === 'Villa' && (
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Parking Spaces</label>
                            <input type="number" value={formData.details.parking_spaces} onChange={e => setFormData({...formData, details: {...formData.details, parking_spaces: e.target.value}})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium" />
                          </div>
                        )}
                        {formData.property_type === 'PG' && (
                          <>
                            <div className="col-span-full">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Sharing Configuration <span className="text-red-500">*</span></label>
                              <div className="flex flex-wrap gap-3">
                                {['Single Sharing', 'Double Sharing', 'Triple Sharing', 'Quad Sharing', 'Dormitory'].map(sharing => (
                                  <label key={sharing} className="flex items-center gap-2 text-sm text-slate-700 bg-white px-3 py-2 border border-slate-200 rounded-lg cursor-pointer">
                                    <input 
                                      type="checkbox" 
                                      checked={formData.details.sharing_types?.includes(sharing) || false}
                                      onChange={e => {
                                        const currentTypes = formData.details.sharing_types || [];
                                        const newTypes = e.target.checked ? [...currentTypes, sharing] : currentTypes.filter((t: string) => t !== sharing);
                                        setFormData({...formData, details: {...formData.details, sharing_types: newTypes}});
                                      }}
                                      className="w-4 h-4 text-brand-purple rounded focus:ring-brand-purple"
                                    />
                                    {sharing}
                                  </label>
                                ))}
                              </div>
                            </div>

                            <div className="col-span-full">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Food Option</label>
                              <div className="flex gap-3">
                                {[{val: 'WITHOUT_FOOD', label: 'Without Food'}, {val: 'WITH_FOOD', label: 'With Food'}, {val: 'BOTH', label: 'Both Options'}].map(opt => (
                                  <label key={opt.val} className={`flex items-center gap-2 text-sm font-bold px-4 py-2 border rounded-lg cursor-pointer transition-colors ${
                                    formData.details.food_option === opt.val ? 'bg-brand-purple text-white border-brand-purple' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-purple/40'
                                  }`}>
                                    <input type="radio" name="food_option" value={opt.val}
                                      checked={formData.details.food_option === opt.val}
                                      onChange={() => setFormData({...formData, details: {...formData.details, food_option: opt.val as any}})}
                                      className="hidden"
                                    />
                                    {opt.label}
                                  </label>
                                ))}
                              </div>
                            </div>

                            {['WITH_FOOD', 'BOTH'].includes(formData.details.food_option) && (
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Rent With Food (₹)</label>
                                <input type="number" value={formData.details.rent_with_food} onChange={e => setFormData({...formData, details: {...formData.details, rent_with_food: e.target.value}})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium" />
                              </div>
                            )}
                            {['WITHOUT_FOOD', 'BOTH'].includes(formData.details.food_option) && (
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Rent Without Food (₹)</label>
                                <input type="number" value={formData.details.rent_without_food} onChange={e => setFormData({...formData, details: {...formData.details, rent_without_food: e.target.value}})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium" />
                              </div>
                            )}

                            <div className="col-span-full">
                              <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={formData.details.attached_washroom}
                                  onChange={e => setFormData({...formData, details: {...formData.details, attached_washroom: e.target.checked}})}
                                  className="w-4 h-4 text-brand-purple rounded focus:ring-brand-purple"
                                />
                                <span className="text-sm font-bold text-slate-700">Attached Washroom</span>
                              </label>
                            </div>
                          </>
                        )}

                        {formData.property_type === 'Commercial' && (
                          <>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Commercial Area (sqft)</label>
                              <input type="number" value={formData.details.commercial_area} onChange={e => setFormData({...formData, details: {...formData.details, commercial_area: e.target.value}})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium" />
                            </div>
                            <div className="flex gap-4 col-span-full">
                              <label className="flex items-center gap-2 text-sm text-slate-700">
                                <input type="checkbox" checked={formData.details.office} onChange={e => setFormData({...formData, details: {...formData.details, office: e.target.checked}})} /> Office Space
                              </label>
                              <label className="flex items-center gap-2 text-sm text-slate-700">
                                <input type="checkbox" checked={formData.details.shop} onChange={e => setFormData({...formData, details: {...formData.details, shop: e.target.checked}})} /> Shop/Retail
                              </label>
                              <label className="flex items-center gap-2 text-sm text-slate-700">
                                <input type="checkbox" checked={formData.details.warehouse} onChange={e => setFormData({...formData, details: {...formData.details, warehouse: e.target.checked}})} /> Warehouse
                              </label>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Descriptions & Gallery */}
                {wizardStep === 3 && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="mb-6">
    <h5 className="text-[10px] uppercase font-bold text-slate-400 mb-2">Short Description (Cards)</h5>
    <input type="text" maxLength={200} value={formData.short_description} onChange={e => setFormData({...formData, short_description: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-primary outline-none" placeholder="Brief summary (max 200 chars)" />
  </div>
  <div className="mb-6">
    <h5 className="text-[10px] uppercase font-bold text-slate-400 mb-2">Full Description</h5>
    <textarea maxLength={5000} value={formData.full_description} onChange={e => setFormData({...formData, full_description: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-primary outline-none h-24" placeholder="Detailed property description..." />
  </div>
  <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-brand-purple" />
                        Property Gallery
                      </h4>
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                        {formData.images.length} / 30 Images Uploaded
                      </span>
                    </div>
                    
                    <IKContext 
                      publicKey={publicKey} 
                      urlEndpoint={urlEndpoint} 
                      authenticator={authenticator}
                    >
                      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors relative cursor-pointer">
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-700">Click to upload images</p>
                        <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-wider">Supports multi-upload • All resolutions</p>
                        <input 
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/avif"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    </IKContext>

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={formData.images.map(img => img.id || img.imagekit_file_id)} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                          {formData.images.map((img, i) => (
                            <SortableImage 
                              key={img.id || img.imagekit_file_id} 
                              id={img.id || img.imagekit_file_id} 
                              img={img} 
                              index={i} 
                              onRemove={() => handleDeleteImage(i)}
                              onSetCover={() => handleSetCover(i)}
                              isEditing={!!editingPropertyId}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                )}

                {/* STEP 4: Amenities & Highlights */}
                {wizardStep === 4 && (
                  <div className="space-y-6 animate-fade-in">
                    <h4 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-4">
                      <Sparkles className="w-4 h-4 text-brand-purple" />
                      Amenities & Highlights
                    </h4>

                    {/* Amenities Categories */}
                    {[
                      { title: 'Basic Amenities', items: ['WiFi', 'Power Backup', 'Water Supply', 'Lift', 'Security', 'CCTV'] },
                      { title: 'Lifestyle', items: ['Gym', 'Swimming Pool', 'Club House', 'Garden', 'Sports Area'] },
                      { title: 'Parking', items: ['Bike Parking', 'Car Parking', 'Visitor Parking'] },
                      { title: 'Room Features', items: ['AC', 'Refrigerator', 'Washing Machine', 'Geyser', 'Furnished', 'Semi Furnished'] },
                      { title: 'Safety & Security', items: ['Gated Community', 'Biometric Entry', 'Fire Safety Equipment'] },
                      { title: 'For PG Properties', items: ['Mess Available', 'Laundry', 'Housekeeping', 'RO Water', 'Common Kitchen'] }
                    ].map(cat => (
                      <div key={cat.title}>
                        <h5 className="text-[10px] uppercase font-bold text-slate-400 mb-2">{cat.title}</h5>
                        <div className="flex flex-wrap gap-2">
                          {cat.items.map(amenity => (
                            <label key={amenity} className={`px-3 py-1.5 rounded-full text-xs font-bold border cursor-pointer transition-colors ${formData.amenities.includes(amenity) ? 'bg-brand-purple text-white border-brand-purple' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                              <input 
                                type="checkbox" 
                                className="hidden"
                                checked={formData.amenities.includes(amenity)}
                                onChange={e => {
                                  if (e.target.checked) setFormData({...formData, amenities: [...formData.amenities, amenity]});
                                  else setFormData({...formData, amenities: formData.amenities.filter(a => a !== amenity)});
                                }}
                              />
                              {amenity}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="mt-8">
                      <h5 className="text-[10px] uppercase font-bold text-slate-400 mb-2">Property Highlights (Top 5)</h5>
                      <div className="space-y-2">
                        {formData.highlights.map((hl, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <input 
                              type="text" 
                              value={hl} 
                              onChange={e => {
                                const newH = [...formData.highlights];
                                newH[i] = e.target.value;
                                setFormData({...formData, highlights: newH});
                              }} 
                              placeholder="e.g. 5 mins from Metro" 
                              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium" 
                            />
                            <button onClick={() => setFormData({...formData, highlights: formData.highlights.filter((_, idx) => idx !== i)})} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {formData.highlights.length < 5 && (
                          <button onClick={() => setFormData({...formData, highlights: [...formData.highlights, '']})} className="text-xs font-bold text-brand-purple hover:underline flex items-center gap-1">
                            <Plus className="w-3 h-3" /> Add Highlight
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: Smart Classification */}
                {wizardStep === 5 && (
                  <div className="space-y-6 animate-fade-in">
                    <h4 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-brand-purple" />
                      Smart Classification
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mb-6">Answer a few questions to automatically generate discovery smart tags for your property.</p>

                    <div className="grid grid-cols-1 gap-6">

                      {/* Location Smart Tags — high-value discovery signals only */}
                      <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl">
                        <h5 className="text-[10px] uppercase font-bold text-slate-400 mb-1">Location Smart Tags</h5>
                        <p className="text-[10px] text-slate-400 mb-3">These appear as discovery badges and help tenants find your property.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {[
                            { key: 'nearMetro', label: 'Near Metro', desc: 'Generates "Near Metro" tag' },
                            { key: 'nearITPark', label: 'Near IT Park / Tech Hub', desc: 'Generates "Tech Hub" tag' },
                            { key: 'nearCollege', label: 'Near College / University', desc: 'Generates "Student Friendly" tag' },
                          ].map(q => (
                            <label key={q.key} className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                              (formData.classificationAnswers as any)[q.key] ? 'bg-brand-purple/5 border-brand-purple/30' : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}>
                              <input
                                type="checkbox"
                                checked={(formData.classificationAnswers as any)[q.key] || false}
                                onChange={e => setFormData({
                                  ...formData,
                                  classificationAnswers: {
                                    ...formData.classificationAnswers,
                                    [q.key]: e.target.checked
                                  }
                                })}
                                className="w-4 h-4 text-brand-purple rounded focus:ring-brand-purple mt-0.5 shrink-0"
                              />
                              <div>
                                <div className="text-sm font-bold text-slate-700">{q.label}</div>
                                <div className="text-[10px] text-slate-400">{q.desc}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Property Quality */}
                      <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Furnishing Status</label>
                          <select
                            value={formData.classificationAnswers.furnishing}
                            onChange={e => setFormData({
                              ...formData,
                              classificationAnswers: { ...formData.classificationAnswers, furnishing: e.target.value }
                            })}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-purple/20 outline-none"
                          >
                            <option>Fully Furnished</option>
                            <option>Semi Furnished</option>
                            <option>Unfurnished</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Property Positioning</label>
                          <select
                            value={formData.classificationAnswers.positioning}
                            onChange={e => setFormData({
                              ...formData,
                              classificationAnswers: { ...formData.classificationAnswers, positioning: e.target.value }
                            })}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-purple/20 outline-none"
                          >
                            <option>Budget Friendly</option>
                            <option>Mid Range</option>
                            <option>Premium Living</option>
                            <option>Luxury Living</option>
                          </select>
                        </div>
                      </div>



                    </div>
                  </div>
                )}

                {/* STEP 6: Contacts */}
                {wizardStep === 6 && (
                  <div className="space-y-6 animate-fade-in">
                    <h4 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-brand-purple" />
                      Property Contacts
                    </h4>
                    
                    {formData.contacts.map((c, i) => (
                      <div key={i} className="p-4 border border-slate-200 rounded-xl bg-slate-50 relative">
                        <button 
                          onClick={() => setFormData({...formData, contacts: formData.contacts.filter((_, idx) => idx !== i)})}
                          className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                          <input type="text" placeholder="Name" value={c.name} onChange={e => {const newC = [...formData.contacts]; newC[i].name = e.target.value; setFormData({...formData, contacts: newC})}} className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium w-full" />
                          <select value={c.role} onChange={e => {const newC = [...formData.contacts]; newC[i].role = e.target.value; setFormData({...formData, contacts: newC})}} className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium w-full">
                            <option>Owner</option><option>Caretaker</option><option>Property Manager</option><option>Maintenance Contact</option>
                          </select>
                          <input type="text" placeholder="Phone" value={c.phone} onChange={e => {const newC = [...formData.contacts]; newC[i].phone = e.target.value; setFormData({...formData, contacts: newC})}} className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium w-full" />
                          <input type="email" placeholder="Email (Optional)" value={c.email} onChange={e => {const newC = [...formData.contacts]; newC[i].email = e.target.value; setFormData({...formData, contacts: newC})}} className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium w-full" />
                        </div>
                      </div>
                    ))}

                    <button 
                      onClick={() => setFormData({...formData, contacts: [...formData.contacts, { name: '', role: 'Caretaker', phone: '', whatsapp: '', email: '' }]})}
                      className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:text-brand-purple hover:border-brand-purple/30 hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add Contact
                    </button>
                  </div>
                )}

                {/* STEP 7: Review Screen */}
                {wizardStep === 7 && (
                  <div className="space-y-6 animate-fade-in">
                    <h4 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-brand-purple" />
                      Review & Complete
                    </h4>
                    
                    {(() => {
                      let score = 0;
                      // Basic Details (30%)
                      if (formData.property_name) score += 10;
                      if (formData.address) score += 10;
                      if (formData.rent_amount) score += 10;
                      
                      // Media (25%)
                      if (formData.images.length >= 3) score += 25;
                      else if (formData.images.length > 0) score += 15;
                      
                      // Features (25%)
                      if (formData.amenities.length >= 3) score += 15;
                      else if (formData.amenities.length > 0) score += 5;
                      if (formData.highlights.filter(Boolean).length > 0) score += 10;
                      
                      // Contacts (20%)
                      if (formData.contacts.some(c => c.name && c.phone)) score += 20;

                      score = Math.min(100, score);

                      return (
                        <div className="bg-brand-purple/5 border border-brand-purple/20 p-4 rounded-xl flex items-center justify-between mb-6">
                          <div>
                            <h5 className="text-xs font-bold text-slate-700">Listing Completeness</h5>
                            <p className="text-[10px] text-slate-500 font-medium mt-0.5">A higher score ranks better in search</p>
                          </div>
                          <div className={`text-xl font-black ${score === 100 ? 'text-emerald-500' : score > 70 ? 'text-brand-purple' : 'text-amber-500'}`}>
                            {score}%
                          </div>
                        </div>
                      );
                    })()}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Summary Cards */}
                      <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl relative">
                        <button onClick={() => setWizardStep(1)} className="absolute top-4 right-4 text-brand-purple hover:underline text-[10px] font-bold">Edit</button>
                        <h5 className="text-[10px] uppercase font-bold text-slate-400 mb-2">Basic Details</h5>
                        <p className="text-xs font-bold text-slate-800">{formData.property_name}</p>
                        <p className="text-xs text-slate-600 font-medium">{formData.property_type} • {formData.city}</p>
                        <p className="text-xs text-slate-600 font-medium mt-1">₹{formData.rent_amount}/mo</p>
                      </div>

                      <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl relative">
                        <button onClick={() => setWizardStep(3)} className="absolute top-4 right-4 text-brand-purple hover:underline text-[10px] font-bold">Edit</button>
                        <h5 className="text-[10px] uppercase font-bold text-slate-400 mb-2">Media</h5>
                        <p className="text-xs font-bold text-slate-800">{formData.images.length} Images Uploaded</p>
                      </div>

                      <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl relative">
                        <button onClick={() => setWizardStep(4)} className="absolute top-4 right-4 text-brand-purple hover:underline text-[10px] font-bold">Edit</button>
                        <h5 className="text-[10px] uppercase font-bold text-slate-400 mb-2">Features</h5>
                        <p className="text-xs font-bold text-slate-800">{formData.amenities.length} Amenities</p>
                        <p className="text-xs text-slate-600 font-medium">{formData.highlights.filter(Boolean).length} Highlights</p>
                      </div>

                      <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl relative">
                        <button onClick={() => setWizardStep(6)} className="absolute top-4 right-4 text-brand-purple hover:underline text-[10px] font-bold">Edit</button>
                        <h5 className="text-[10px] uppercase font-bold text-slate-400 mb-2">Contacts</h5>
                        {formData.contacts.map((c, i) => (
                          <p key={i} className="text-xs font-bold text-slate-800">{c.role}: <span className="font-medium text-slate-600">{c.name}</span></p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
                {wizardStep > 1 ? (
                  <button onClick={handlePrevStep} className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 flex items-center gap-1">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                ) : (
                  <button onClick={handleCancel} className="px-4 py-2 text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100">
                    Cancel Listing
                  </button>
                )}

                {wizardStep < 7 ? (
                  <button onClick={handleNextStep} className="px-5 py-2 text-xs font-bold text-white bg-slate-800 rounded-xl hover:bg-slate-900 shadow-md flex items-center gap-1">
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button onClick={handleSubmit} disabled={submitting} className="px-6 py-2 text-xs font-bold text-white bg-brand-purple rounded-xl hover:bg-[#003B1F] shadow-md shadow-brand-purple/20 flex items-center gap-2">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Complete Listing
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Property Details View Modal */}
      <AnimatePresence>
        {viewingProperty && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-left"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
                <div>
                  <h3 className="font-black text-slate-800 text-lg">{viewingProperty.property_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-slate-500 font-medium">Smart Classified Tags & Details</p>
                    {viewingProperty.property_code && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] text-slate-300">|</span>
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-brand-purple/10 border border-brand-purple/20 rounded-md">
                          <Hash className="w-3 h-3 text-brand-purple" />
                          <span className="text-[10px] font-black text-brand-purple tracking-wider">{viewingProperty.property_code}</span>
                        </div>
                        <button
                          onClick={() => copyPropertyCode(viewingProperty.property_code)}
                          className="p-1 rounded-md hover:bg-white transition-colors text-slate-400 hover:text-brand-purple"
                          title="Copy Property Code"
                        >
                          {copiedCode === viewingProperty.property_code ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={() => setViewingProperty(null)} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-700 shadow-sm border border-slate-100 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/30">
                <div className="space-y-8">
                  {/* Property Information */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Building2 className="w-4.5 h-4.5 text-brand-purple" />
                      Property Information
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold text-slate-700">
                      <div><span className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Type</span>{viewingProperty.property_type}</div>
                      <div><span className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Location</span>{viewingProperty.locality || viewingProperty.city}</div>
                      <div><span className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Monthly Rent</span>₹{viewingProperty.rent_amount?.toLocaleString() || 0}</div>
                      <div><span className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Deposit</span>₹{viewingProperty.deposit_amount?.toLocaleString() || 0}</div>
                    </div>
                    <div className="mt-4 text-xs text-slate-600 leading-relaxed">
                      {viewingProperty.full_description || viewingProperty.short_description || 'No description provided.'}
                    </div>
                  </div>

                  {/* Property Images */}
                  {viewingProperty.images?.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <ImageIcon className="w-4.5 h-4.5 text-blue-500" />
                        Property Images
                      </h4>
                      <div className="flex gap-4 overflow-x-auto pb-2">
                        {viewingProperty.images.map((imgUrl: string, idx: number) => (
                          <div key={idx} className="w-32 h-24 shrink-0 rounded-xl overflow-hidden border border-slate-200 relative">
                            <img src={imgUrl} alt={`Property ${idx + 1}`} className="w-full h-full object-cover bg-slate-100" />
                            {idx === 0 && <div className="absolute top-1 right-1 bg-brand-purple text-white text-[8px] font-bold px-1.5 py-0.5 rounded">COVER</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Amenities */}
                  {viewingProperty.amenities?.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Sparkles className="w-4.5 h-4.5 text-amber-500" />
                        Amenities
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {viewingProperty.amenities.map((amenity: string, idx: number) => (
                          <span key={idx} className="text-xs px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 font-bold border border-amber-100 flex items-center gap-1.5">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contacts */}
                  {viewingProperty.contacts?.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Phone className="w-4.5 h-4.5 text-emerald-500" />
                        Contacts
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {viewingProperty.contacts.map((c:any, idx: number) => (
                          <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex flex-col gap-1">
                            <span className="font-bold text-slate-800">{c.name} <span className="text-[9px] text-slate-500 font-bold uppercase ml-1">({c.role})</span></span>
                            <span className="text-slate-600 flex items-center gap-1"><Phone className="w-3 h-3"/> {c.phone}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Visual grouping of tags */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Users className="w-4.5 h-4.5 text-purple-500" />
                      Smart Highlights
                    </h4>
                    {(() => {
                      const tags = getSmartTags(viewingProperty);
                      return (
                        <div className="flex flex-wrap gap-2">
                          {tags.length > 0 ? tags.map((t:string, idx:number) => (
                            <span key={idx} className="text-xs font-bold px-3 py-1.5 bg-brand-purple/5 text-brand-purple rounded-lg border border-brand-purple/20 flex items-center gap-1.5">
                              {t}
                            </span>
                          )) : <span className="text-xs text-slate-400 font-medium italic">No tags assigned.</span>}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Future Ready Placeholder */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 text-center opacity-70">
                      <Wallet className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                      <span className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Rent Tracking</span>
                      <span className="text-[9px] font-semibold text-slate-400 block mt-1">Coming Soon</span>
                    </div>
                    <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 text-center opacity-70">
                      <CheckCircle2 className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                      <span className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Payment Status</span>
                      <span className="text-[9px] font-semibold text-slate-400 block mt-1">Coming Soon</span>
                    </div>
                    <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 text-center opacity-70">
                      <AlertTriangle className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                      <span className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Maintenance Requests</span>
                      <span className="text-[9px] font-semibold text-slate-400 block mt-1">Coming Soon</span>
                    </div>
                  </div>

                  {/* Tenants Section (Last) */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Users className="w-4.5 h-4.5 text-indigo-500" />
                      Active Tenants
                    </h4>
                    {viewingProperty.tenants?.length > 0 ? (
                      <div className="space-y-3">
                        {viewingProperty.tenants.map((t:any) => (
                          <div key={t.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                            <div>
                              <span className="font-bold text-slate-800 text-sm block">{t.users?.full_name}</span>
                              <div className="flex items-center gap-3 text-[10px] text-slate-500 font-semibold mt-1">
                                <span className="flex items-center gap-1"><Phone className="w-3 h-3"/> {t.users?.phone || 'N/A'}</span>
                                <span className="flex items-center gap-1"><Mail className="w-3 h-3"/> {t.users?.email}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                               <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1">Joined {new Date(t.joined_at).toLocaleDateString()}</span>
                               <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-[9px] uppercase rounded">
                                 {t.status}
                               </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                        <span className="text-xs text-slate-400 font-bold">No active tenants assigned to this property.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {paymentGateOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4"
            onClick={() => setPaymentGateOpen(false)}
          >
            <motion.div
              initial={{ y: 20, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6"
            >
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Add Payment Details</h3>
              <p className="mt-2 text-sm text-slate-500">
                Before publishing your property, please add your bank account so you can receive rent payments.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setPaymentGateOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setPaymentGateOpen(false);
                    window.dispatchEvent(new CustomEvent('owner:open-payment-details'));
                  }}
                  className="flex-1 rounded-xl bg-brand-purple px-4 py-3 text-sm font-black text-white"
                >
                  Add Payment Details
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {createdProperty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4"
            onClick={() => setCreatedProperty(null)}
          >
            <motion.div
              initial={{ y: 16, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 16, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6"
            >
              <p className="text-[10px] uppercase tracking-[0.24em] font-black text-brand-purple">Property Created</p>
              <h3 className="mt-2 text-xl font-black text-slate-900 dark:text-white">Your property is ready</h3>
              <p className="mt-2 text-sm text-slate-500">
                Share this property code with tenants so they can join after you publish it.
              </p>
              <div className="mt-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Property Code</p>
                <p className="text-lg font-black font-mono tracking-[0.25em] text-slate-900 dark:text-white">
                  {createdProperty.property_code || 'Available after publish'}
                </p>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setCreatedProperty(null)}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200"
                >
                  Close
                </button>
                {createdProperty.property_code && (
                  <button
                    onClick={() => copyPropertyCode(createdProperty.property_code)}
                    className="flex-1 rounded-xl bg-brand-purple px-4 py-3 text-sm font-black text-white"
                  >
                    Copy Code
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PropertyDetailsDrawer 
        property={viewingProperty} 
        isOpen={!!viewingProperty} 
        onClose={() => setViewingProperty(null)}
      />
    </div>
  );
}
