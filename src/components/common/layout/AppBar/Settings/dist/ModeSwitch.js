// src/components/common/layout/AppBar/Settings/ModeSwitch.tsx
'use client';
"use strict";
exports.__esModule = true;
var React = require("react");
var Box_1 = require("@mui/material/Box");
var FormControl_1 = require("@mui/material/FormControl");
var InputLabel_1 = require("@mui/material/InputLabel");
var MenuItem_1 = require("@mui/material/MenuItem");
var Select_1 = require("@mui/material/Select");
var styles_1 = require("@mui/material/styles");
function ModeSwitch() {
    var _a = styles_1.useColorScheme(), mode = _a.mode, setMode = _a.setMode;
    if (!mode) {
        return null;
    }
    return (React.createElement(Box_1["default"], { sx: {
            display: 'flex',
            justifyContent: 'flex-end',
            mt: 1,
            p: 1
        } },
        React.createElement(FormControl_1["default"], null,
            React.createElement(InputLabel_1["default"], { id: "mode-select-label" }, "Theme"),
            React.createElement(Select_1["default"], { labelId: "mode-select-label", id: "mode-select", value: mode, onChange: function (event) { return setMode(event.target.value); }, label: "Theme" },
                React.createElement(MenuItem_1["default"], { value: "system" }, "System"),
                React.createElement(MenuItem_1["default"], { value: "light" }, "Light"),
                React.createElement(MenuItem_1["default"], { value: "dark" }, "Dark")))));
}
exports["default"] = ModeSwitch;
