// src/components/common/events/EventActionsMenu.tsx
import * as React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";

interface EventActionsMenuProps {
  onEdit?: () => void;
  onDelete?: () => void;
  showEdit?: boolean;
  showDelete?: boolean;
  sx?: any;
}

export default function EventActionsMenu({
  onEdit,
  onDelete,
  showEdit = true,
  showDelete = true,
  sx,
}: EventActionsMenuProps) {
  const { t } = useTranslation();
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleEdit = () => {
    onEdit?.();
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete?.();
    handleMenuClose();
  };

  return (
    <Box
      sx={{
        borderRadius: "50%",
        backdropFilter: "blur(1000px)",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        ...sx,
      }}
    >
      <IconButton
        onClick={handleMenuOpen}
        size="small"
        sx={{
          color: "text.secondary",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.04)",
          },
        }}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1,
            minWidth: 140,
            "& .MuiMenuItem-root": {
              px: 2,
              py: 1,
            },
          },
        }}
      >
        {showEdit && onEdit && (
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t("event.edit.button")}</ListItemText>
          </MenuItem>
        )}
        {showDelete && onDelete && (
          <MenuItem onClick={handleDelete}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t("event.delete.button")}</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
}
