"use strict";
exports.__esModule = true;
exports.DesktopNavigation = exports.MobileNavigation = void 0;
// src/components/common/layout/AppBar/NavigationMenu/NavigationMenu.tsx
var material_1 = require("@mui/material");
var react_i18next_1 = require("react-i18next");
exports.MobileNavigation = function (_a) {
    var anchorElNav = _a.anchorElNav, handleCloseNavMenu = _a.handleCloseNavMenu, handleOpenNavMenu = _a.handleOpenNavMenu, pages = _a.pages;
    var t = react_i18next_1.useTranslation().t;
    return (React.createElement(material_1.Box, { sx: { flexGrow: 1, display: { xs: 'flex', md: 'none' } } },
        React.createElement(material_1.Menu, { id: "mobile-menu", anchorEl: anchorElNav, open: Boolean(anchorElNav), onClose: handleCloseNavMenu, sx: { display: { xs: 'block', md: 'none' } } }, pages.map(function (page) { return (React.createElement(material_1.MenuItem, { key: page, onClick: handleCloseNavMenu },
            React.createElement(material_1.Typography, { textAlign: "center" }, t("nav." + page)))); }))));
};
exports.DesktopNavigation = function (_a) {
    var pages = _a.pages, handleCloseNavMenu = _a.handleCloseNavMenu;
    var t = react_i18next_1.useTranslation().t;
    return (React.createElement(material_1.Box, { sx: { flexGrow: 1, display: { xs: 'none', md: 'flex' } } }, pages.map(function (page) { return (React.createElement(material_1.Button, { key: page, onClick: handleCloseNavMenu, sx: { my: 2, color: 'white', display: 'block' } }, t("nav." + page))); })));
};
