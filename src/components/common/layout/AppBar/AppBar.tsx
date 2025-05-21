// src/components/common/layout/AppBar/AppBar.tsx
"use client";
import { useState } from "react";
import { AppBar, Container, IconButton, Toolbar, Box } from "@mui/material";
// @ts-ignore
import MenuIcon from "@mui/icons-material/Menu";
import Logo from "@/components/common/layout/AppBar/Logo/Logo";
import {
  MobileNavigation,
  DesktopNavigation,
} from "@/components/common/layout/AppBar/NavigationMenu/NavigationMenu";
import UserProfileMenu from "@/components/common/layout/AppBar/UserProfileMenu/UserProfileMenu";
import LanguageSwitcher from "@/components/common/layout/AppBar/Settings/LanguageSwitcher";
import ModeSwitch from "@/components/common/layout/AppBar/Settings/ModeSwitch";
import NotificationCenter from "@/components/common/notification/NotificationCenter";
import { useTranslation } from "react-i18next";

export default function CustomAppBar() {
  const { t } = useTranslation();
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const pages = [
    { title: t("nav.new-calendar"), path: "/new-calendar" },
    {
      title: t("nav.dezentralschweiz"),
      path: "/calendar/naddr1qqyrsdeevfskxvfjqydhwumn8ghj7mn0wd68ytnnwa5hxuedv4hxjemdvyhxx6qzyzym2fnu9uvw04mq5lyzjwvat5x6jgaksl2nagn2dlf45ac0nxhqzqcyqqq8edqr02a67",
    },
  ];
  const settings = [t("logout")];

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleUserMenu = (event?: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event ? event.currentTarget : null);
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Logo />

          {/* Mobile Navigation */}
          <IconButton
            size="large"
            aria-label="menu"
            onClick={handleOpenNavMenu}
            color="inherit"
            sx={{ display: { xs: "flex", md: "none" }, mr: 1 }}
          >
            <MenuIcon />
          </IconButton>

          <MobileNavigation
            anchorElNav={anchorElNav}
            handleCloseNavMenu={handleCloseNavMenu}
            pages={pages}
          />

          <DesktopNavigation
            pages={pages}
            handleCloseNavMenu={handleCloseNavMenu}
          />

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <NotificationCenter />
            <LanguageSwitcher />
            <ModeSwitch />
            <UserProfileMenu settings={settings} />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
