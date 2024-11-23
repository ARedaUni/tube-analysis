'use client'
// Update theme-provider.tsx to simply re-export from 'next-themes'
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export const ThemeProvider = NextThemesProvider;
