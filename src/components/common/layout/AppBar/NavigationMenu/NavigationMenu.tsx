// src/components/common/layout/AppBar/NavigationMenu/NavigationMenu.tsx
import { Box, Button, Menu, MenuItem, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import Link from "next/link";

// Updated interface definitions
interface MobileNavigationProps {
  anchorElNav: null | HTMLElement;
  handleCloseNavMenu: () => void;
  pages: Array<{ title: string; path: string }>;
}

interface DesktopNavigationProps {
  pages: Array<{ title: string; path: string }>;
  handleCloseNavMenu: () => void;
}

export const MobileNavigation = ({
  anchorElNav,
  handleCloseNavMenu,
  pages,
}: MobileNavigationProps) => {
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
          <MenuItem
            key={page.path}
            onClick={handleCloseNavMenu}
            component={Link}
            href={page.path}
            passHref
          >
            <Typography textAlign="center">{page.title}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export const DesktopNavigation = ({
  pages,
  handleCloseNavMenu,
}: DesktopNavigationProps) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
      {pages.map((page) => (
        <Button
          key={page.path}
          onClick={handleCloseNavMenu}
          component={Link}
          href={page.path}
          sx={{ my: 2, color: "white", display: "block" }}
        >
          {page.title}
        </Button>
      ))}
    </Box>
  );
};
