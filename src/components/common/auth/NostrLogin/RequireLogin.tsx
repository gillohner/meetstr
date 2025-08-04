// src/components/common/auth/NostrLogin/RequireLogin.tsx
import * as React from "react";
import { useActiveUser } from '@/hooks/useActiveUser';
import LoginButton from "@/components/common/auth/NostrLogin/LoginButton";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function RequireLogin({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const activeUser = useActiveUser();

  // Debug logging
  React.useEffect(() => {
    console.log('RequireLogin - activeUser:', activeUser);
    console.log('RequireLogin - window.nostr:', typeof window !== 'undefined' ? window.nostr : 'undefined');
  }, [activeUser]);

  if (!activeUser) {
    return (
      <Box sx={{ textAlign: "center", my: 4 }}>
        <Typography variant="h6" gutterBottom>
          {t("login.requireLogin")}
        </Typography>
        <LoginButton />
      </Box>
    );
  }

  return <>{children}</>;
}
