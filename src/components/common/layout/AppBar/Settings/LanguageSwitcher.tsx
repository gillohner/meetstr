// src/components/common/layout/AppBar/Settings/LanguageSwitcher.tsx
'use client';
import * as React from 'react';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useColorScheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    document.cookie = `lang=${lang}; path=/`;
  };

  return (
    <Box
        sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            mt: 1,
            p: 1,
        }}
    >
        <FormControl>
            <InputLabel id="lang-select-label">Language</InputLabel>
            <Select
                labelId="lang-select-label"
                id="lang-select"
                value={i18n.language}
                onChange={(event) => handleLanguageChange(event.target.value as string)}
                label="Theme"
            >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="de">Deutsch</MenuItem>
            </Select>
        </FormControl>
    </Box>
  );
}
