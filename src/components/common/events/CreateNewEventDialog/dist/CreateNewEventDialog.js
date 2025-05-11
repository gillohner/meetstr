"use strict";
exports.__esModule = true;
var React = require("react");
var Button_1 = require("@mui/material/Button");
var Dialog_1 = require("@mui/material/Dialog");
var DialogActions_1 = require("@mui/material/DialogActions");
var DialogContent_1 = require("@mui/material/DialogContent");
var DialogTitle_1 = require("@mui/material/DialogTitle");
var TextField_1 = require("@mui/material/TextField");
var MenuItem_1 = require("@mui/material/MenuItem");
var LocalizationProvider_1 = require("@mui/x-date-pickers/LocalizationProvider");
var AdapterDayjs_1 = require("@mui/x-date-pickers/AdapterDayjs");
var DateTimePicker_1 = require("@mui/x-date-pickers/DateTimePicker");
var dayjs_1 = require("dayjs");
var utc_1 = require("dayjs/plugin/utc");
var timezone_1 = require("dayjs/plugin/timezone");
var Grid_1 = require("@mui/material/Grid");
var react_i18next_1 = require("react-i18next");
var InputAdornment_1 = require("@mui/material/InputAdornment");
var Box_1 = require("@mui/material/Box");
var Paper_1 = require("@mui/material/Paper");
var Divider_1 = require("@mui/material/Divider");
var Typography_1 = require("@mui/material/Typography");
// Import icons
var Event_1 = require("@mui/icons-material/Event");
var LocationOn_1 = require("@mui/icons-material/LocationOn");
var Description_1 = require("@mui/icons-material/Description");
var AccessTime_1 = require("@mui/icons-material/AccessTime");
var Public_1 = require("@mui/icons-material/Public");
var Image_1 = require("@mui/icons-material/Image");
dayjs_1["default"].extend(utc_1["default"]);
dayjs_1["default"].extend(timezone_1["default"]);
function EventDialogTemplate() {
    var t = react_i18next_1.useTranslation().t;
    var _a = React.useState(false), open = _a[0], setOpen = _a[1];
    var _b = React.useState(dayjs_1["default"].tz.guess()), timezone = _b[0], setTimezone = _b[1];
    var _c = React.useState(""), preview = _c[0], setPreview = _c[1];
    var handleFileChange = function (event) {
        var _a;
        var file = (_a = event.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (file) {
            var reader = new FileReader();
            reader.onload = function (e) { var _a; return setPreview((_a = e.target) === null || _a === void 0 ? void 0 : _a.result); };
            reader.readAsDataURL(file);
        }
    };
    return (React.createElement(React.Fragment, null,
        React.createElement(Button_1["default"], { variant: "outlined", onClick: function () { return setOpen(true); } }, "Create Event"),
        React.createElement(Dialog_1["default"], { open: open, onClose: function () { return setOpen(false); }, maxWidth: "md", fullWidth: true },
            React.createElement(DialogTitle_1["default"], { sx: { bgcolor: "background.default", color: "text.primary" } },
                React.createElement(Typography_1["default"], { variant: "h5", component: "div" },
                    React.createElement(Event_1["default"], { sx: { mr: 1, verticalAlign: "middle", color: "primary.main" } }),
                    "New Event Details")),
            React.createElement(DialogContent_1["default"], { sx: { bgcolor: "background.paper" } },
                React.createElement("form", null,
                    React.createElement(Grid_1["default"], { container: true, spacing: 2, direction: "row", sx: { marginTop: 1 } },
                        React.createElement(Grid_1["default"], { size: { xs: 12, md: 6 } },
                            " ",
                            React.createElement(Grid_1["default"], { container: true, spacing: 2, direction: "column" },
                                React.createElement(Grid_1["default"], { size: 12 },
                                    React.createElement(TextField_1["default"], { fullWidth: true, label: "Event Title", name: "title", required: true, sx: {
                                            "& .MuiInputBase-root": { bgcolor: "background.paper" },
                                            "& .MuiInputLabel-root": { color: "text.primary" }
                                        }, InputProps: {
                                            startAdornment: (React.createElement(InputAdornment_1["default"], { position: "start" },
                                                React.createElement(Event_1["default"], { color: "primary" })))
                                        } })),
                                React.createElement(Grid_1["default"], { item: true, size: 12 },
                                    React.createElement(TextField_1["default"], { fullWidth: true, multiline: true, minRows: 4, label: "Description", name: "description", sx: {
                                            "& .MuiInputBase-root": { bgcolor: "background.paper" },
                                            "& .MuiInputLabel-root": { color: "text.primary" }
                                        }, InputProps: {
                                            startAdornment: (React.createElement(InputAdornment_1["default"], { position: "start" },
                                                React.createElement(Description_1["default"], { color: "primary" })))
                                        } })))),
                        React.createElement(Grid_1["default"], { size: { xs: 12, md: 6 } },
                            " ",
                            React.createElement(Grid_1["default"], { container: true, spacing: 2.5, direction: "column" },
                                React.createElement(Grid_1["default"], { item: true },
                                    React.createElement(Box_1["default"], { sx: { display: "flex", flexDirection: "column", alignItems: "center" } },
                                        React.createElement(Button_1["default"], { component: "label", variant: "outlined", fullWidth: true, startIcon: React.createElement(Image_1["default"], { color: "primary" }), sx: { mb: 2, color: "primary.main", borderColor: "primary.main" } },
                                            "Upload Image",
                                            React.createElement("input", { type: "file", accept: "image/*", hidden: true, onChange: handleFileChange })),
                                        preview && (React.createElement(Paper_1["default"], { elevation: 2, sx: { p: 1, width: "100%", bgcolor: "background.default" } },
                                            React.createElement("img", { src: preview, alt: "Event preview", style: { width: "100%", height: "auto", borderRadius: "4px" } }))))),
                                React.createElement(Grid_1["default"], { item: true },
                                    React.createElement(TextField_1["default"], { fullWidth: true, label: "Location", name: "location", autoComplete: "off", sx: {
                                            "& .MuiInputBase-root": { bgcolor: "background.paper" },
                                            "& .MuiInputLabel-root": { color: "text.primary" }
                                        }, InputProps: {
                                            startAdornment: (React.createElement(InputAdornment_1["default"], { position: "start" },
                                                React.createElement(LocationOn_1["default"], { color: "primary" })))
                                        } })))),
                        React.createElement(Grid_1["default"], { size: 12 },
                            React.createElement(Paper_1["default"], { elevation: 0, sx: { p: 2, bgcolor: "black" } },
                                React.createElement(Typography_1["default"], { variant: "subtitle1", gutterBottom: true, color: "text.primary" }, "Date and Time"),
                                React.createElement(Grid_1["default"], { container: true, spacing: 2, direction: "row" },
                                    React.createElement(Grid_1["default"], { size: { xs: 12, md: 4 } },
                                        React.createElement(LocalizationProvider_1.LocalizationProvider, { dateAdapter: AdapterDayjs_1.AdapterDayjs, adapterLocale: timezone },
                                            React.createElement(DateTimePicker_1.DateTimePicker, { label: "Start Time", slotProps: {
                                                    textField: {
                                                        fullWidth: true,
                                                        sx: {
                                                            "& .MuiInputBase-root": { bgcolor: "background.paper" },
                                                            "& .MuiInputLabel-root": { color: "text.primary" }
                                                        },
                                                        InputProps: {
                                                            startAdornment: (React.createElement(InputAdornment_1["default"], { position: "start" },
                                                                React.createElement(AccessTime_1["default"], { color: "primary" })))
                                                        }
                                                    }
                                                } }))),
                                    React.createElement(Grid_1["default"], { size: { xs: 12, md: 4 } },
                                        React.createElement(LocalizationProvider_1.LocalizationProvider, { dateAdapter: AdapterDayjs_1.AdapterDayjs, adapterLocale: timezone },
                                            React.createElement(DateTimePicker_1.DateTimePicker, { label: "End Time", slotProps: {
                                                    textField: {
                                                        fullWidth: true,
                                                        sx: {
                                                            "& .MuiInputBase-root": { bgcolor: "background.paper" },
                                                            "& .MuiInputLabel-root": { color: "text.primary" }
                                                        },
                                                        InputProps: {
                                                            startAdornment: (React.createElement(InputAdornment_1["default"], { position: "start" },
                                                                React.createElement(AccessTime_1["default"], { color: "primary" })))
                                                        }
                                                    }
                                                } }))),
                                    React.createElement(Grid_1["default"], { size: { xs: 12, md: 4 } },
                                        React.createElement(TextField_1["default"], { select: true, fullWidth: true, label: t("event.createEvent.form.timezone"), value: timezone, onChange: function (e) { return setTimezone(e.target.value); }, sx: {
                                                "& .MuiInputBase-root": { bgcolor: "background.paper" },
                                                "& .MuiInputLabel-root": { color: "text.primary" }
                                            }, InputProps: {
                                                startAdornment: (React.createElement(InputAdornment_1["default"], { position: "start" },
                                                    React.createElement(Public_1["default"], { color: "primary" })))
                                            } }, Intl.supportedValuesOf("timeZone").map(function (tz) { return (React.createElement(MenuItem_1["default"], { key: tz, value: tz }, tz)); }))))))),
                    React.createElement(Divider_1["default"], { sx: { my: 3, borderColor: "divider" } }),
                    React.createElement(DialogActions_1["default"], { sx: { bgcolor: "background.default" } },
                        React.createElement(Button_1["default"], { onClick: function () { return setOpen(false); }, sx: { color: "text.primary" } }, "Cancel"),
                        React.createElement(Button_1["default"], { type: "submit", variant: "contained", color: "primary" }, "Create")))))));
}
exports["default"] = EventDialogTemplate;
