"use client";
import { useContext, useEffect, useState } from 'react';
import AppButton, { AppButtonType } from './common/button/Button';
import { ThemeContext } from '../context/ThemeContext';

export const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div>
      <span>The current theme is: {theme}</span>
      <AppButton onClick={() => toggleTheme()} type={AppButtonType.primary}>Toggle</AppButton>
      {
        //<AppButton onClick={() => setTheme('dark')} type={AppButtonType.secondary}>Dark Mode</AppButton>
        //<AppButton onClick={() => setTheme('dark')} type={AppButtonType.accent}>Dark Mode</AppButton>
        //<AppButton onClick={() => setTheme('dark')} type={AppButtonType.success}>Dark Mode</AppButton>
        //<AppButton onClick={() => setTheme('dark')} type={AppButtonType.error}>Dark Mode</AppButton>
        //<AppButton onClick={() => setTheme('dark')} type={AppButtonType.warning}>Dark Mode</AppButton>
        //<AppButton onClick={() => setTheme('dark')} type={AppButtonType.info} disabled={true}>Dark Mode</AppButton>
        //<AppButton onClick={() => setTheme('dark')} type={AppButtonType.neutral}>Dark Mode</AppButton>
      }
    </div>
  );
};

