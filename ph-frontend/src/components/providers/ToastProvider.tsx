'use client';

import { Toaster } from 'sonner';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: 'border-border',
        style: {
          borderRadius: '0.5rem',
        },
      }}
    />
  );
}
