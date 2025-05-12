"use strict";
exports.__esModule = true;
// src/components/common/auth/NostrLogin/RequireLogin.tsx
var React = require("react");
var nostr_hooks_1 = require("nostr-hooks");
var LoginButton_1 = require("@/components/common/auth/NostrLogin/LoginButton");
var react_i18next_1 = require("react-i18next");
var Box_1 = require("@mui/material/Box");
var Typography_1 = require("@mui/material/Typography");
function RequireLogin(_a) {
    var children = _a.children;
    var t = react_i18next_1.useTranslation().t;
    var activeUser = nostr_hooks_1.useActiveUser().activeUser;
    if (!activeUser) {
        return (React.createElement(Box_1["default"], { sx: {
                my: 4,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center"
            } },
            React.createElement(Typography_1["default"], { variant: "h5", component: "h5", sx: { mb: 2 } }, t("login.requireLogin")),
            React.createElement(LoginButton_1["default"], null)));
    }
    return React.createElement(React.Fragment, null, children);
}
exports["default"] = RequireLogin;
