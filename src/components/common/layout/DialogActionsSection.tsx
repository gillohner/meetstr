import { Button, DialogActions } from "@mui/material";
import { useTranslation } from "react-i18next";

export const DialogActionsSection = ({
  onSubmit,
  onCancel,
  submitLabel = "common.create",
}: {
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel?: string;
}) => {
  const { t } = useTranslation();

  return (
    <DialogActions sx={{ bgcolor: "background.default" }}>
      <Button onClick={onCancel} sx={{ color: "text.primary" }}>
        {t("common.cancel")}
      </Button>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        onClick={onSubmit}
      >
        {t(submitLabel)}
      </Button>
    </DialogActions>
  );
};

export default DialogActionsSection;
