"use strict";
exports.__esModule = true;
exports.useSnackbar = exports.SnackbarProvider = void 0;
// src/context/SnackbarContext.tsx
var react_1 = require("react");
var material_1 = require("@mui/material");
var SnackbarContext = react_1.createContext({});
exports.SnackbarProvider = function (_a) {
    var children = _a.children;
    var _b = react_1.useState(false), open = _b[0], setOpen = _b[1];
    var _c = react_1.useState(""), message = _c[0], setMessage = _c[1];
    var _d = react_1.useState("info"), severity = _d[0], setSeverity = _d[1];
    var showSnackbar = function (newMessage, newSeverity) {
        setMessage(newMessage);
        setSeverity(newSeverity);
        setOpen(true);
    };
    var handleClose = function () {
        setOpen(false);
    };
    return (react_1["default"].createElement(SnackbarContext.Provider, { value: { showSnackbar: showSnackbar } },
        children,
        react_1["default"].createElement(material_1.Snackbar, { open: open, autoHideDuration: 6000, onClose: handleClose, anchorOrigin: { vertical: "bottom", horizontal: "right" } },
            react_1["default"].createElement(material_1.Alert, { onClose: handleClose, severity: severity, sx: { width: "100%" } }, message))));
};
exports.useSnackbar = function () { return react_1.useContext(SnackbarContext); };
