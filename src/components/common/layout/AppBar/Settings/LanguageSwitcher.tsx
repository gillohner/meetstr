// src/components/common/layout/AppBar/Settings/LanguageSwitcher.tsx
"use client";
import * as React from "react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import LanguageIcon from "@mui/icons-material/Language";
import Tooltip from "@mui/material/Tooltip";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    document.cookie = `lang=${lang}; path=/`;
    handleClose();
  };

  return (
    <>
      <Tooltip title="Change language">
        <IconButton
          color="inherit"
          onClick={handleOpen}
          aria-label="Change language"
          sx={{ ml: 1 }}
        >
          <LanguageIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          selected={i18n.language === "en"}
          onClick={() => handleLanguageChange("en")}
        >
          English
        </MenuItem>
        <MenuItem
          selected={i18n.language === "de"}
          onClick={() => handleLanguageChange("de")}
        >
          Deutsch
        </MenuItem>
      </Menu>
    </>
  );
}
