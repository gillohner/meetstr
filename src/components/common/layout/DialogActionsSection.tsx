// src/components/common/layout/DialogActionsSection.tsx
import { Button, DialogActions } from "@mui/material";
import { useTranslation } from "react-i18next";

export const DialogActionsSection = ({
  onCancel,
  submitLabel = "common.create",
  disabled = false,
}: {
  onCancel: () => void;
  submitLabel?: string;
  disabled?: boolean;
}) => {
  const { t } = useTranslation();

  return (
    <DialogActions>
      <Button onClick={onCancel} sx={{ color: "text.primary" }}>
        {t("common.cancel")}
      </Button>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={disabled}
      >
        {t(submitLabel)}
      </Button>
    </DialogActions>
  );
};

export default DialogActionsSection;
