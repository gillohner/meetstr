"use client";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter, usePathname } from "next/navigation";
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
  Divider,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  CalendarMonth as CalendarIcon,
  Event as EventIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import Logo from "@/components/common/layout/AppBar/Logo/Logo";
import ModeSwitch from "@/components/common/layout/AppBar/Settings/ModeSwitch";
import LanguageSwitcher from "@/components/common/layout/AppBar/Settings/LanguageSwitcher";
import NotificationCenter from "@/components/common/notification/NotificationCenter";

const RAIL_WIDTH = 80;
const DRAWER_WIDTH = 280;

interface NavigationItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const NavigationRail: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigationItems: NavigationItem[] = [
    {
      key: "events",
      label: t("nav.events", "Events"),
      icon: <EventIcon />,
      path: "/events",
    },
    {
      key: "calendars",
      label: t("nav.calendars", "Calendars"),
      icon: <CalendarIcon />,
      path: "/calendars",
    },
    {
      key: "dezentralschweiz",
      label: t("nav.dezentralschweiz", "DezentralSchweiz"),
      icon: <CalendarIcon />,
      path: "/calendar/naddr1qqyrsdeevfskxvfjqydhwumn8ghj7mn0wd68ytnnwa5hxuedv4hxjemdvyhxx6qzyzym2fnu9uvw04mq5lyzjwvat5x6jgaksl2nagn2dlf45ac0nxhqzqcyqqq8edqr02a67",
    },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    if (path.startsWith("/calendar/")) {
      return pathname.startsWith("/calendar/");
    }
    return pathname.startsWith(path);
  };

  const NavigationContent = ({ isDrawer = false }: { isDrawer?: boolean }) => (
    <Box
      sx={{
        width: isDrawer ? DRAWER_WIDTH : RAIL_WIDTH,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        borderRight: `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* Logo/Header */}
      <Box
        sx={{
          p: isDrawer ? 2 : 1,
          display: "flex",
          alignItems: "center",
          justifyContent: isDrawer ? "flex-start" : "center",
          minHeight: 64,
        }}
      >
        {isDrawer ? (
          <Logo isMobile={false} />
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "primary.main" }}
            >
              meetstr
            </Typography>
          </Box>
        )}
      </Box>

      <Divider />

      {/* Navigation Items */}
      <List sx={{ flex: 1, px: isDrawer ? 1 : 0.5 }}>
        {navigationItems.map((item) => (
          <ListItem key={item.key} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={isActive(item.path)}
              sx={{
                minHeight: 72,
                borderRadius: 2,
                flexDirection: isDrawer ? "row" : "column",
                px: isDrawer ? 2 : 1,
                py: isDrawer ? 1.5 : 1,
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                  "& .MuiListItemIcon-root": {
                    color: "primary.contrastText",
                  },
                },
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: isDrawer ? 56 : "auto",
                  justifyContent: "center",
                  mb: isDrawer ? 0 : 0.5,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  variant: "caption",
                  align: isDrawer ? "left" : "center",
                  sx: {
                    fontSize: isDrawer ? "0.875rem" : "0.75rem",
                    fontWeight: isActive(item.path) ? 600 : 400,
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Settings/User Section */}
      <Box
        sx={{
          p: isDrawer ? 2 : 1,
          display: "flex",
          flexDirection: isDrawer ? "row" : "column",
          alignItems: "center",
          gap: 1,
        }}
      >
        <ModeSwitch />
        <LanguageSwitcher />
        <NotificationCenter />
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <IconButton
          color="inherit"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: theme.zIndex.drawer + 1,
            bgcolor: "background.paper",
            boxShadow: 2,
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
            },
          }}
        >
          <NavigationContent isDrawer={true} />
        </Drawer>
      )}

      {/* Desktop Navigation Rail */}
      {!isMobile && (
        <Box
          sx={{
            position: "fixed",
            left: 0,
            top: 0,
            zIndex: theme.zIndex.drawer,
            display: { xs: "none", md: "block" },
          }}
        >
          <NavigationContent />
        </Box>
      )}
    </>
  );
};

export default NavigationRail;
