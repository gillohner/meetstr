"use client";
import React from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import NavigationRail from "@/components/common/layout/NavigationRail";

const RAIL_WIDTH = 80;

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <NavigationRail />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: "100vh",
          ml: isMobile ? 0 : `${RAIL_WIDTH}px`,
          pt: isMobile ? 8 : 0, // Add top padding on mobile for menu button
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AppLayout;
