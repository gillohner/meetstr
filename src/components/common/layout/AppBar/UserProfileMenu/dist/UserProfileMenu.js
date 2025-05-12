"use strict";
exports.__esModule = true;
// src/components/common/layout/AppBar/UserProfileMenu/UserProfileMenu.tsx
var material_1 = require("@mui/material");
var nostr_hooks_1 = require("nostr-hooks");
var LoginButton_1 = require("@/components/common/auth/NostrLogin/LoginButton");
var react_i18next_1 = require("react-i18next");
function UserProfileMenu(_a) {
    var _b, _c;
    var anchorElUser = _a.anchorElUser, handleCloseUserMenu = _a.handleCloseUserMenu, settings = _a.settings;
    var t = react_i18next_1.useTranslation().t;
    var logout = nostr_hooks_1.useLogin().logout;
    var activeUser = nostr_hooks_1.useActiveUser().activeUser;
    var userProfile = nostr_hooks_1.useProfile({ pubkey: activeUser === null || activeUser === void 0 ? void 0 : activeUser.pubkey });
    var handleMenuAction = function (setting) {
        if (setting === t('logout')) {
            logout();
        }
        handleCloseUserMenu();
    };
    return (React.createElement(material_1.Box, { sx: { flexGrow: 0 } }, (userProfile === null || userProfile === void 0 ? void 0 : userProfile.status) === "success" ? (React.createElement(React.Fragment, null,
        React.createElement(material_1.Tooltip, { title: t('tooltip.openProfile') },
            React.createElement(material_1.IconButton, { onClick: function (e) { return handleCloseUserMenu(e); }, sx: { p: 0 } },
                React.createElement(material_1.Avatar, { alt: ((_b = userProfile.profile) === null || _b === void 0 ? void 0 : _b.name) || 'Anonymous', src: ((_c = userProfile.profile) === null || _c === void 0 ? void 0 : _c.image) || '/default-avatar.png' }))),
        React.createElement(material_1.Menu, { sx: { mt: '45px' }, id: "user-menu", anchorEl: anchorElUser, open: Boolean(anchorElUser), onClose: handleCloseUserMenu }, settings.map(function (setting) { return (React.createElement(material_1.MenuItem, { key: setting, onClick: function () { return handleMenuAction(setting); } },
            React.createElement(material_1.Typography, { textAlign: "center" }, setting))); })))) : (React.createElement(LoginButton_1["default"], { color: "inherit" }))));
}
exports["default"] = UserProfileMenu;
;
