// src/components/common/ImageUploadWithPreview.tsx
import React, { useState } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import ImageIcon from "@mui/icons-material/Image";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";

interface ImageUploadWithPreviewProps {
  initialPreview?: string;
  onImageUploaded: (imageUrl: string) => void;
  onImageRemoved?: () => void;
  uploadFunction: (file: File) => Promise<string>;
  showControls?: boolean;
}

const ImageUploadWithPreview: React.FC<ImageUploadWithPreviewProps> = ({
  initialPreview = "",
  onImageUploaded,
  onImageRemoved,
  uploadFunction,
  showControls = true,
}) => {
  const { t } = useTranslation();
  const [preview, setPreview] = useState<string>(initialPreview);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset previous preview if needed
    setLoading(true);

    try {
      // Create object URL for immediate preview
      const localPreview = URL.createObjectURL(file);
      setPreview(localPreview);

      // Upload file to server
      const imageUrl = await uploadFunction(file);

      if (!imageUrl || imageUrl === "error") {
        throw new Error("Upload failed");
      }

      // Update preview with actual URL from server
      setPreview(imageUrl);

      // Notify parent component
      onImageUploaded(imageUrl);
    } catch (error) {
      console.error("Upload failed:", error);
      setPreview("");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview("");
    if (onImageRemoved) {
      onImageRemoved();
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      {!preview && (
        <Button
          component="label"
          variant="outlined"
          fullWidth
          startIcon={<ImageIcon color="primary" />}
          sx={{ mb: 2, color: "primary.main", borderColor: "primary.main" }}
          disabled={loading}
        >
          {t("event.createEvent.imageUpload.upload")}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileChange}
            disabled={loading}
          />
        </Button>
      )}

      {preview && (
        <Box sx={{ position: "relative", width: "100%" }}>
          <Paper elevation={2} sx={{ p: 1, width: "100%", bgcolor: "background.default" }}>
            <Box sx={{ position: "relative" }}>
              <img
                src={preview}
                alt="Event preview"
                style={{ width: "100%", height: "auto", borderRadius: "4px" }}
              />

              {/* Overlay loading spinner while uploading */}
              {loading && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    borderRadius: "4px",
                    zIndex: 1,
                  }}
                >
                  <CircularProgress color="primary" />
                </Box>
              )}
            </Box>
          </Paper>

          {/* Image controls */}
          {showControls && !loading && (
            <Box sx={{ mt: 1, display: "flex", justifyContent: "center", gap: 1 }}>
              <Button
                component="label"
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                sx={{ color: "primary.main", borderColor: "primary.main" }}
              >
                {t("common.change")}
                <input type="file" accept="image/*" hidden onChange={handleFileChange} />
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DeleteIcon />}
                onClick={handleRemoveImage}
                sx={{ color: "error.main", borderColor: "error.main" }}
              >
                {t("common.remove")}
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ImageUploadWithPreview;
