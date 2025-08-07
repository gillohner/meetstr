// src/components/common/layout/AppBar/AppBar.tsx
"use client";
import { AppBar, Container, Toolbar, Box } from "@mui/material";
import Logo from "@/components/common/layout/AppBar/Logo/Logo";
import ModeSwitch from "@/components/common/layout/AppBar/Settings/ModeSwitch";
import LanguageSwitcher from "@/components/common/layout/AppBar/Settings/LanguageSwitcher";
import NotificationCenter from "@/components/common/notification/NotificationCenter";

export default function CustomAppBar() {
  return (
    <AppBar position="static" sx={{ display: { xs: "block", md: "none" } }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Logo />
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1, ml: "auto" }}
          >
            <ModeSwitch />
            <LanguageSwitcher />
            <NotificationCenter />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
