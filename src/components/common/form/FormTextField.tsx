// src/components/common/form/FormTextField.tsx
import { useTranslation } from "react-i18next";
import { TextField, InputAdornment } from "@mui/material";

export const FormTextField = ({
  label,
  name,
  icon,
  multiline = false,
  required = false,
}: {
  label: string;
  name: string;
  icon: React.ReactElement;
  multiline?: boolean;
  required?: boolean;
}) => {
  const { t } = useTranslation();

  return (
    <TextField
      fullWidth
      label={t(label)}
      name={name}
      required={required}
      multiline={multiline}
      minRows={multiline ? 4 : undefined}
      InputProps={{
        startAdornment: <InputAdornment position="start">{icon}</InputAdornment>,
      }}
    />
  );
};

export default FormTextField;
