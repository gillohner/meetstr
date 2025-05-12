// src/components/common/layout/AppBar/AppBar.tsx
"use client";
"use strict";
exports.__esModule = true;
var react_1 = require("react");
var material_1 = require("@mui/material");
var Menu_1 = require("@mui/icons-material/Menu");
var Logo_1 = require("@/components/common/layout/AppBar/Logo/Logo");
var NavigationMenu_1 = require("@/components/common/layout/AppBar/NavigationMenu/NavigationMenu");
var UserProfileMenu_1 = require("@/components/common/layout/AppBar/UserProfileMenu/UserProfileMenu");
var LanguageSwitcher_1 = require("@/components/common/layout/AppBar/Settings/LanguageSwitcher");
var ModeSwitch_1 = require("@/components/common/layout/AppBar/Settings/ModeSwitch");
var react_i18next_1 = require("react-i18next");
function CustomAppBar() {
    var t = react_i18next_1.useTranslation().t;
    var _a = react_1.useState(null), anchorElNav = _a[0], setAnchorElNav = _a[1];
    var _b = react_1.useState(null), anchorElUser = _b[0], setAnchorElUser = _b[1];
    var pages = ['newCalendar', 'pricing', 'blog'];
    var settings = [t('logout')];
    var handleOpenNavMenu = function (event) {
        setAnchorElNav(event.currentTarget);
    };
    var handleCloseNavMenu = function () {
        setAnchorElNav(null);
    };
    var handleUserMenu = function (event) {
        setAnchorElUser((event === null || event === void 0 ? void 0 : event.currentTarget) || null);
    };
    return (React.createElement(material_1.AppBar, { position: "static" },
        React.createElement(material_1.Container, { maxWidth: "xl" },
            React.createElement(material_1.Toolbar, { disableGutters: true },
                React.createElement(Logo_1["default"], null),
                React.createElement(material_1.IconButton, { size: "large", "aria-label": "menu", onClick: handleOpenNavMenu, color: "inherit", sx: { display: { xs: 'flex', md: 'none' }, mr: 1 } },
                    React.createElement(Menu_1["default"], null)),
                React.createElement(NavigationMenu_1.MobileNavigation, { anchorElNav: anchorElNav, handleCloseNavMenu: handleCloseNavMenu, pages: pages }),
                React.createElement(NavigationMenu_1.DesktopNavigation, { pages: pages, handleCloseNavMenu: handleCloseNavMenu }),
                React.createElement(material_1.Box, { sx: { display: 'flex', alignItems: 'center', gap: 2 } },
                    React.createElement(LanguageSwitcher_1["default"], null),
                    React.createElement(ModeSwitch_1["default"], null),
                    React.createElement(UserProfileMenu_1["default"], { anchorElUser: anchorElUser, handleCloseUserMenu: handleUserMenu, settings: settings }))))));
}
exports["default"] = CustomAppBar;
;
