// src/components/common/layout/AppBar/UserProfileMenu/UserProfileMenu.tsx
import React from "react";
import {
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import { useActiveUser, useLogin, useProfile } from "nostr-hooks";
import LoginButton from "@/components/common/auth/NostrLogin/LoginButton";
import { useTranslation } from "react-i18next";

// Update prop types
interface UserProfileMenuProps {
  settings: string[];
}

export default function UserProfileMenu({ settings }: UserProfileMenuProps) {
  const { t } = useTranslation();
  const { logout } = useLogin();
  const { activeUser } = useActiveUser();
  const userProfile = useProfile({ pubkey: activeUser?.pubkey });

  // Local state for anchor element
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleMenuAction = (setting: string) => {
    if (setting === t("logout")) {
      logout();
    }
    handleCloseUserMenu();
  };

  return (
    <Box sx={{ flexGrow: 0 }}>
      {userProfile?.status === "success" ? (
        <>
          <Tooltip title={t("tooltip.openProfile")}>
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar
                alt={userProfile.profile?.name || "Anonymous"}
                src={userProfile.profile?.image || "/default-avatar.png"}
              />
            </IconButton>
          </Tooltip>
          <Menu
            id="user-menu"
            anchorEl={anchorElUser}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            {settings.map((setting) => (
              <MenuItem key={setting} onClick={() => handleMenuAction(setting)}>
                <Typography textAlign="center">{setting}</Typography>
              </MenuItem>
            ))}
          </Menu>
        </>
      ) : (
        <LoginButton color="primary" />
      )}
    </Box>
  );
}
