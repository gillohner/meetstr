// src/components/common/auth/NostrLogin/LoginButton.tsx
"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Typography,
  Modal,
  Box,
  Tabs,
  Tab,
  TextField,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useActiveUser, useLogin, useProfile } from "nostr-hooks";

const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  maxWidth: "90vw",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  maxHeight: "90vh",
  overflow: "auto",
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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return value === index ? <Box sx={{ p: 3 }}>{children}</Box> : null;
}

export default function LoginButton({
  variant = "contained",
  color = "primary",
  errorColor = "error",
}: LoginButtonProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [remoteSignerInput, setRemoteSignerInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { activeUser } = useActiveUser();
  const userProfile = useProfile({ pubkey: activeUser?.pubkey });
  const { loginWithExtension, loginWithRemoteSigner } = useLogin();

  const handleOpen = () => {
    setOpen(true);
    setErrorMessage("");
    setTabValue(0);
  };

  const handleClose = () => {
    setOpen(false);
    setErrorMessage("");
    setRemoteSignerInput("");
    setIsLoading(false);
  };

  const handleTabChange = (_: any, newValue: number) => {
    setTabValue(newValue);
    setErrorMessage("");
  };

  // Extension login
  const handleExtensionLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithExtension({
        onSuccess: () => {
          setIsLoading(false);
          handleClose();
        },
        onError: (err) => {
          console.error(err);
          setErrorMessage(t("modal.login.extension.error"));
          setIsLoading(false);
        },
      });
    } catch {
      setErrorMessage(t("modal.login.extension.error"));
      setIsLoading(false);
    }
  };

  // Remote signer login
  const handleRemoteSignerLogin = async () => {
    const addr = remoteSignerInput.trim();
    if (!addr) {
      setErrorMessage(t("modal.login.remoteSigner.inputRequired"));
      return;
    }
    setIsLoading(true);
    try {
      await loginWithRemoteSigner({
        nip46Address: addr,
        onSuccess: () => {
          setIsLoading(false);
          handleClose();
        },
        onError: (err) => {
          console.error(err);
          setErrorMessage(t("modal.login.remoteSigner.error"));
          setIsLoading(false);
        },
      });
    } catch {
      setErrorMessage(t("modal.login.remoteSigner.error"));
      setIsLoading(false);
    }
  };

  // Simple bunker/NIP-05 validation
  const validateRemoteSignerInput = (input: string) => {
    const trimmed = input.trim();
    if (trimmed.startsWith("bunker://")) {
      return /^bunker:\/\/[0-9a-f]{64}.*/.test(trimmed);
    }
    return /\S+@\S+\.\S+/.test(trimmed);
  };

  // Disable while profile loading or not found
  if (userProfile?.status === "loading") {
    return (
      <Button disabled variant={variant} color={color}>
        {t("navbar.login.loading")}
      </Button>
    );
  }
  if (userProfile?.status === "not-found") {
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

      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Typography variant="h6" align="center" mb={2}>
            {t("modal.login.title")}
          </Typography>

          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label={t("modal.login.tabs.extension")} />
            <Tab label={t("modal.login.tabs.remoteSigner")} />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Typography mb={2}>
              {t("modal.login.extension.description")}
            </Typography>
            <Button
              variant="contained"
              onClick={handleExtensionLogin}
              disabled={isLoading}
              fullWidth
            >
              {isLoading ? (
                <CircularProgress size={24} />
              ) : (
                t("modal.login.extension.button")
              )}
            </Button>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography mb={2}>
              {t("modal.login.remoteSigner.description")}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={2}
              label={t("modal.login.remoteSigner.inputLabel")}
              helperText={t("modal.login.remoteSigner.inputHelper")}
              value={remoteSignerInput}
              onChange={(e) => setRemoteSignerInput(e.target.value)}
              error={
                remoteSignerInput &&
                !validateRemoteSignerInput(remoteSignerInput)
              }
              mb={2}
            />
            <Button
              variant="contained"
              onClick={handleRemoteSignerLogin}
              disabled={
                isLoading || !validateRemoteSignerInput(remoteSignerInput)
              }
              fullWidth
            >
              {isLoading ? (
                <CircularProgress size={24} />
              ) : (
                t("modal.login.remoteSigner.button")
              )}
            </Button>
          </TabPanel>

          {errorMessage && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errorMessage}
            </Alert>
          )}
        </Box>
      </Modal>
    </>
  );
}
