"use strict";
exports.__esModule = true;
exports.DialogActionsSection = void 0;
// src/components/common/layout/DialogActionsSection.tsx
var material_1 = require("@mui/material");
var react_i18next_1 = require("react-i18next");
exports.DialogActionsSection = function (_a) {
    var onCancel = _a.onCancel, _b = _a.submitLabel, submitLabel = _b === void 0 ? "common.create" : _b;
    var t = react_i18next_1.useTranslation().t;
    return (React.createElement(material_1.DialogActions, { sx: { bgcolor: "background.default" } },
        React.createElement(material_1.Button, { onClick: onCancel, sx: { color: "text.primary" } }, t("common.cancel")),
        React.createElement(material_1.Button, { type: "submit", variant: "contained", color: "primary" }, t(submitLabel))));
};
exports["default"] = exports.DialogActionsSection;
