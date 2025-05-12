"use strict";
exports.__esModule = true;
exports.DateTimeSection = void 0;
// src/components/common/events/DateTimeSection.tsx
var x_date_pickers_1 = require("@mui/x-date-pickers");
var DateTimePicker_1 = require("@mui/x-date-pickers/DateTimePicker");
var AdapterDayjs_1 = require("@mui/x-date-pickers/AdapterDayjs");
var react_i18next_1 = require("react-i18next");
var material_1 = require("@mui/material");
var SectionHeader_1 = require("@/components/common/layout/SectionHeader");
// import Icons
var AccessTime_1 = require("@mui/icons-material/AccessTime");
var Public_1 = require("@mui/icons-material/Public");
exports.DateTimeSection = function (_a) {
    var timezone = _a.timezone, onTimezoneChange = _a.onTimezoneChange;
    var t = react_i18next_1.useTranslation().t;
    return (React.createElement(material_1.Paper, { elevation: 0, sx: { p: 2, bgcolor: "background.paper" } },
        React.createElement(SectionHeader_1["default"], { title: t("event.createEvent.dateTime.title") }),
        React.createElement(material_1.Grid, { container: true, spacing: 2, direction: "row" },
            React.createElement(material_1.Grid, { size: { xs: 12, md: 4 } },
                React.createElement(x_date_pickers_1.LocalizationProvider, { dateAdapter: AdapterDayjs_1.AdapterDayjs, adapterLocale: timezone },
                    React.createElement(DateTimePicker_1.DateTimePicker, { label: t("event.createEvent.dateTime.start"), slotProps: {
                            textField: {
                                fullWidth: true,
                                InputProps: {
                                    startAdornment: (React.createElement(material_1.InputAdornment, { position: "start" },
                                        React.createElement(AccessTime_1["default"], { color: "primary" })))
                                }
                            }
                        } }))),
            React.createElement(material_1.Grid, { size: { xs: 12, md: 4 } },
                React.createElement(x_date_pickers_1.LocalizationProvider, { dateAdapter: AdapterDayjs_1.AdapterDayjs, adapterLocale: timezone },
                    React.createElement(DateTimePicker_1.DateTimePicker, { label: t("event.createEvent.dateTime.end"), slotProps: {
                            textField: {
                                fullWidth: true,
                                InputProps: {
                                    startAdornment: (React.createElement(material_1.InputAdornment, { position: "end" },
                                        React.createElement(AccessTime_1["default"], { color: "primary" })))
                                }
                            }
                        } }))),
            React.createElement(material_1.Grid, { size: { xs: 12, md: 4 } },
                React.createElement(material_1.TextField, { select: true, fullWidth: true, label: t("event.createEvent.form.timezone"), value: timezone, onChange: function (e) { return onTimezoneChange(e.target.value); }, InputProps: {
                        startAdornment: (React.createElement(material_1.InputAdornment, { position: "start" },
                            React.createElement(Public_1["default"], { color: "primary" })))
                    } }, Intl.supportedValuesOf("timeZone").map(function (tz) { return (React.createElement(material_1.MenuItem, { key: tz, value: tz }, tz)); }))))));
};
exports["default"] = exports.DateTimeSection;
