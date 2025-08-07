// src/components/common/layout/AppBar/Settings/ModeSwitch.tsx
"use client";
import * as React from "react";
import IconButton from "@mui/material/IconButton";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Tooltip from "@mui/material/Tooltip";
import { useColorScheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

export default function ModeSwitch() {
  const { t } = useTranslation();
  const { mode, setMode } = useColorScheme();

  if (!mode) {
    return null;
  }

  // Toggle between light and dark
  const nextMode = mode === "dark" ? "light" : "dark";
  const icon = mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />;
  const label =
    mode === "dark"
      ? t("modeswitch.light", "Switch to light mode")
      : t("modeswitch.dark", "Switch to dark mode");

  return (
    <Tooltip title={label}>
      <IconButton
        edge="end"
        color="inherit"
        onClick={() => setMode(nextMode)}
        aria-label={label}
      >
        {icon}
      </IconButton>
    </Tooltip>
  );
}
