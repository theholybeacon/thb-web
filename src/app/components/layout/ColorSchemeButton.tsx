"use client";
import { useMantineColorScheme, Button } from '@mantine/core';
import { useMounted } from '@mantine/hooks';
import { MdOutlineDarkMode, MdOutlineLightMode } from 'react-icons/md';

export function ColorSchemeButton() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const mounted = useMounted();


  if (mounted)
    return (
      <Button onClick={toggleColorScheme} px="xs" variant='transparent' className='color-scheme-button'>
        {colorScheme === "light" ? <MdOutlineDarkMode size={20} /> : <MdOutlineLightMode size={20} />}
      </Button>
    );
}

