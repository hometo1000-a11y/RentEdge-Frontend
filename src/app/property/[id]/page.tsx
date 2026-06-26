'use client';

import React, { use } from 'react';
import PropertyDetailPage from '@/components/PropertyDetailPage';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
  // Unwrap params using React.use() as per modern Next.js conventions
  const { id } = use(params);

  return (
    <PropertyDetailPage propertyId={id} />
  );
}
