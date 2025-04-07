"use client";

import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { useTranslation } from "react-i18next";
import { useLogin } from "nostr-hooks";
import { Divider } from "@mui/material";
import { useActiveUser } from "nostr-hooks";
import { useProfile } from "nostr-hooks";

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

export default function LoginButton({
  variant = "contained",
  color = "primary",
  errorColor = "error",
}) {
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

  const { loginWithExtension, loginWithRemoteSigner, loginWithPrivateKey } =
    useLogin();

  const handleLoginWithRemoteSigner = async () => {
    try {
      await loginWithRemoteSigner(remoteSignerKey);
    } catch (error) {
      setErrorMessage(t("error.remoteSignerFailure"));
    }
  };

  const handleLoginWithPrivateKey = async () => {
    try {
      await loginWithPrivateKey(privateKey);
    } catch (error) {
      setErrorMessage(t("error.invalidPrivateKey"));
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
          <Button variant={variant} color={color} onClick={loginWithExtension}>
            {t("modal.login.extension")}
          </Button>
          <Divider sx={{ my: 2 }} />
          <TextField
            label={t("modal.login.remoteSignerInput")}
            variant="outlined"
            fullWidth
            value={remoteSignerKey}
            onChange={(e) => setRemoteSignerKey(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant={variant}
            color={color}
            onClick={handleLoginWithRemoteSigner}
          >
            {t("modal.login.remoteSigner")}
          </Button>
          <Divider sx={{ my: 2 }} />
          <TextField
            label={t("modal.login.privateKeyInput")}
            variant="outlined"
            fullWidth
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant={variant}
            color={color}
            onClick={handleLoginWithPrivateKey}
          >
            {t("modal.login.privateKey")}
          </Button>
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
