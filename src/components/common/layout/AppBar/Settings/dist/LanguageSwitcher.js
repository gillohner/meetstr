// src/components/common/layout/AppBar/Settings/LanguageSwitcher.tsx
'use client';
"use strict";
exports.__esModule = true;
var React = require("react");
var Box_1 = require("@mui/material/Box");
var FormControl_1 = require("@mui/material/FormControl");
var InputLabel_1 = require("@mui/material/InputLabel");
var MenuItem_1 = require("@mui/material/MenuItem");
var Select_1 = require("@mui/material/Select");
var react_i18next_1 = require("react-i18next");
function LanguageSwitcher() {
    var i18n = react_i18next_1.useTranslation().i18n;
    var handleLanguageChange = function (lang) {
        i18n.changeLanguage(lang);
        document.cookie = "lang=" + lang + "; path=/";
    };
    return (React.createElement(Box_1["default"], { sx: {
            display: 'flex',
            justifyContent: 'flex-end',
            mt: 1,
            p: 1
        } },
        React.createElement(FormControl_1["default"], null,
            React.createElement(InputLabel_1["default"], { id: "lang-select-label" }, "Language"),
            React.createElement(Select_1["default"], { labelId: "lang-select-label", id: "lang-select", value: i18n.language, onChange: function (event) { return handleLanguageChange(event.target.value); }, label: "Theme" },
                React.createElement(MenuItem_1["default"], { value: "en" }, "English"),
                React.createElement(MenuItem_1["default"], { value: "de" }, "Deutsch")))));
}
exports["default"] = LanguageSwitcher;
