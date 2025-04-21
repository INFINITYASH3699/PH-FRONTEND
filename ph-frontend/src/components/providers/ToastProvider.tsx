'use client';

import React, { useState, useEffect } from 'react';
import { Toaster } from 'sonner';

export function ToastProvider() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only render the Toaster on the client side to prevent hydration issues
  if (!isMounted) {
    return null;
  }

  return (
    <Toaster position="top-right" richColors closeButton />
  );
}

export default ToastProvider;
