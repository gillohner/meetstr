// src/components/common/layout/DialogActionsSection.tsx
import { Button, DialogActions } from "@mui/material";
import { useTranslation } from "react-i18next";

export const DialogActionsSection = ({
  onCancel,
  submitLabel = "common.create",
}: {
  onCancel: () => void;
  submitLabel?: string;
}) => {
  const { t } = useTranslation();

  return (
    <DialogActions sx={{ bgcolor: "background.default" }}>
      <Button onClick={onCancel} sx={{ color: "text.primary" }}>
        {t("common.cancel")}
      </Button>
      <Button type="submit" variant="contained" color="primary">
        {t(submitLabel)}
      </Button>
    </DialogActions>
  );
};

export default DialogActionsSection;
