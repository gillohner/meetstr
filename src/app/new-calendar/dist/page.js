// src/app/new-calendar/page.tsx
"use client";
"use strict";
exports.__esModule = true;
var React = require("react");
var Container_1 = require("@mui/material/Container");
var Typography_1 = require("@mui/material/Typography");
var Box_1 = require("@mui/material/Box");
var NostrEventCreation_1 = require("@/components/NostrEventCreation");
var react_i18next_1 = require("react-i18next");
function NewCalendar() {
    var t = react_i18next_1.useTranslation().t;
    return (React.createElement(Container_1["default"], { maxWidth: "lg" },
        React.createElement(Box_1["default"], { sx: {
                my: 4,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center"
            } },
            React.createElement(Typography_1["default"], { variant: "h4", component: "h1", sx: { mb: 2 } }, t("createCalendar.title")),
            React.createElement(Box_1["default"], { sx: {
                    my: 4,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center"
                } },
                React.createElement(NostrEventCreation_1.CreateCalendarForm, null)))));
}
exports["default"] = NewCalendar;
