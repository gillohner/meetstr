// src/components/common/form/TagInputField.tsx
import { useState, useCallback } from "react";
import { Box, TextField, Chip, Typography } from "@mui/material";

interface TagInputFieldProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export default function TagInputField({
  label,
  values,
  onChange,
  placeholder,
}: TagInputFieldProps) {
  const [currentValue, setCurrentValue] = useState("");

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (["Enter", "Tab", ","].includes(e.key)) {
        e.preventDefault();
        const value = currentValue.trim();
        if (value) {
          onChange([...values, value]);
          setCurrentValue("");
        }
      }
    },
    [currentValue, values, onChange]
  );

  const handleDelete = useCallback(
    (index: number) => {
      const newValues = values.filter((_, i) => i !== index);
      onChange(newValues);
    },
    [values, onChange]
  );

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="subtitle2" gutterBottom>
        {label}
      </Typography>

      <TextField
        fullWidth
        variant="outlined"
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        sx={{ mb: 1 }}
      />

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {values.map((value, index) => (
          <Chip
            key={index}
            label={value}
            onDelete={() => handleDelete(index)}
            color="primary"
            variant="outlined"
          />
        ))}
      </Box>
    </Box>
  );
}
