// src/components/common/auth/NostrLogin/RequireLogin.tsx
import * as React from "react";
import { useActiveUser } from "nostr-hooks";
import LoginButton from "@/components/common/auth/NostrLogin/LoginButton";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function RequireLogin({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { activeUser } = useActiveUser();

  if (!activeUser) {
    return (
      <Box
        sx={{
          my: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" component="h5" sx={{ mb: 2 }}>
          {t("login.requireLogin")}
        </Typography>
        <LoginButton />
      </Box>
    );
  }

  return <>{children}</>;
}
