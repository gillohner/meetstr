// src/components/common/layout/AppBar/UserProfileMenu/UserProfileMenu.tsx
import { Avatar, Box, IconButton, Menu, MenuItem, Tooltip, Typography } from "@mui/material";
import { useActiveUser, useLogin, useProfile } from "nostr-hooks";
import LoginButton from "@/components/common/auth/NostrLogin/LoginButton";
import { useTranslation } from "react-i18next";

// Update prop types
interface UserProfileMenuProps {
  anchorElUser: HTMLElement | null;
  handleCloseUserMenu: (event?: React.MouseEvent<HTMLElement>) => void;
  settings: string[];
}

export default function UserProfileMenu({
  anchorElUser,
  handleCloseUserMenu,
  settings,
}: UserProfileMenuProps) {
  const { t } = useTranslation();
  const { logout } = useLogin();
  const { activeUser } = useActiveUser();
  const userProfile = useProfile({ pubkey: activeUser?.pubkey });

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
            <IconButton onClick={(e) => handleCloseUserMenu(e)} sx={{ p: 0 }}>
              <Avatar
                alt={userProfile.profile?.name || "Anonymous"}
                src={userProfile.profile?.image || "/default-avatar.png"}
              />
            </IconButton>
          </Tooltip>
          <Menu
            sx={{ mt: "45px" }}
            id="user-menu"
            anchorEl={anchorElUser}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            {settings.map((setting) => (
              <MenuItem key={setting} onClick={() => handleMenuAction(setting)}>
                <Typography textAlign="center">{setting}</Typography>
              </MenuItem>
            ))}
          </Menu>
        </>
      ) : (
        <LoginButton color="inherit" />
      )}
    </Box>
  );
}
