// src/components/common/layout/AppBar/NavigationMenu/NavigationMenu.tsx
import { Box, Button, Menu, MenuItem, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export const MobileNavigation = ({ anchorElNav, handleCloseNavMenu, pages }) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
      <Menu
        id="mobile-menu"
        anchorEl={anchorElNav}
        open={Boolean(anchorElNav)}
        onClose={handleCloseNavMenu}
        sx={{ display: { xs: "block", md: "none" } }}
      >
        {pages.map((page) => (
          <MenuItem key={page} onClick={handleCloseNavMenu}>
            <Typography textAlign="center">{t(`nav.${page}`)}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export const DesktopNavigation = ({ pages, handleCloseNavMenu }) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
      {pages.map((page) => (
        <Button
          key={page}
          onClick={handleCloseNavMenu}
          sx={{ my: 2, color: "white", display: "block" }}
        >
          {t(`nav.${page}`)}
        </Button>
      ))}
    </Box>
  );
};
