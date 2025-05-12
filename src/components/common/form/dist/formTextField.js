"use strict";
exports.__esModule = true;
exports.FormTextField = void 0;
// src/components/common/form/FormTextField.tsx
var react_i18next_1 = require("react-i18next");
var material_1 = require("@mui/material");
exports.FormTextField = function (_a) {
    var label = _a.label, name = _a.name, icon = _a.icon, _b = _a.multiline, multiline = _b === void 0 ? false : _b, _c = _a.required, required = _c === void 0 ? false : _c;
    var t = react_i18next_1.useTranslation().t;
    return (React.createElement(material_1.TextField, { fullWidth: true, label: t(label), name: name, required: required, multiline: multiline, minRows: multiline ? 4 : undefined, InputProps: {
            startAdornment: React.createElement(material_1.InputAdornment, { position: "start" }, icon)
        } }));
};
exports["default"] = exports.FormTextField;
