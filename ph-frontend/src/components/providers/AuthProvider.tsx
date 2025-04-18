'use client';

import { ReactNode } from 'react';
import { AuthProvider as CustomAuthProvider } from './AuthContext';

export default function AuthProvider({ children }: { children: ReactNode }) {
  return <CustomAuthProvider>{children}</CustomAuthProvider>;
}
