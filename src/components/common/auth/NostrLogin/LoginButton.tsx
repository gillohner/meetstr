// src/components/common/auth/NostrLogin/LoginButton.tsx
"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Divider, Button, Typography, Modal, Box } from "@mui/material";
import { useActiveUser, useLogin, useProfile } from "nostr-hooks";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  textAlign: "center",
};

interface LoginButtonProps {
  variant?: "text" | "contained" | "outlined";
  color?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
  errorColor?:
    | "primary"
    | "secondary"
    | "error"
    | "warning"
    | "info"
    | "success";
}

export default function LoginButton({
  variant = "contained",
  color = "primary",
  errorColor = "error",
}: LoginButtonProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [remoteSignerKey, setRemoteSignerKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { activeUser } = useActiveUser();
  const userProfile = useProfile({ pubkey: activeUser?.pubkey });

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setErrorMessage("");
  };

  const { loginWithExtension } = useLogin();

  const handleExtensionLogin = async () => {
    try {
      await loginWithExtension({
        onSuccess: (signer) => {
          // Handle successful login
          handleClose();
        },
        onError: (err) => {
          setErrorMessage(t("errors.login_failed"));
          console.error("Login failed:", err);
        },
      });
    } catch (err) {
      setErrorMessage(t("errors.login_failed"));
      console.error("Login error:", err);
    }
  };

  if (userProfile?.status == "loading") {
    return (
      <Button disabled variant={variant} color={color}>
        {t("navbar.login.loading")}
      </Button>
    );
  }
  if (userProfile?.status == "not-found") {
    return (
      <Button disabled variant={variant} color={errorColor}>
        {t("navbar.login.not-found")}
      </Button>
    );
  }

  return (
    <>
      <Button variant={variant} color={color} onClick={handleOpen}>
        {t("navbar.login.login")}
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            marginBottom={2}
          >
            {t("modal.login.title")}
          </Typography>
          <Button
            variant={variant}
            color={color}
            onClick={handleExtensionLogin}
          >
            {t("modal.login.extension")}
          </Button>
          <Divider sx={{ my: 2 }} />
          {errorMessage && (
            <Typography color="error" sx={{ mt: 2 }}>
              {errorMessage}
            </Typography>
          )}
        </Box>
      </Modal>
    </>
  );
}
