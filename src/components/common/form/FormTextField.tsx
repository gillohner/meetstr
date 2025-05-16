// src/components/common/form/FormTextField.tsx
import { useTranslation } from "react-i18next";
import { TextField, InputAdornment, TextFieldProps } from "@mui/material";

interface FormTextFieldProps extends Omit<TextFieldProps, "label"> {
  label: string;
  icon: React.ReactElement;
}

export const FormTextField = ({
  label,
  name,
  value,
  onChange,
  icon,
  multiline = false,
  required = false,
}: FormTextFieldProps) => {
  const { t } = useTranslation();

  return (
    <TextField
      fullWidth
      label={t(label)}
      name={name}
      value={value}
      onChange={onChange}
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
