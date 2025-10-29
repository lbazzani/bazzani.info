'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface GenerativeArtDemoProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GenerativeArtDemo({ isOpen, onClose }: GenerativeArtDemoProps) {
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      // Navigate to the gallery page instead of a specific sketch
      router.push('/s');
      // Close the modal immediately
      onClose();
    }
  }, [isOpen, router, onClose]);

  // No UI needed - just redirect
  return null;
}
