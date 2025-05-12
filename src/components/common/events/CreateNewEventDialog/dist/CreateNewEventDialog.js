"use strict";
exports.__esModule = true;
// src/components/common/events/CreateNewEventDialog/CreateNewEventDialog.tsx
var React = require("react");
var react_1 = require("react");
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
var Paper_1 = require("@mui/material/Paper");
var Divider_1 = require("@mui/material/Divider");
var Typography_1 = require("@mui/material/Typography");
var useBlossomUpload_1 = require("@/hooks/useBlossomUpload");
var nostr_hooks_1 = require("nostr-hooks");
var SnackbarContext_1 = require("@/context/SnackbarContext");
var ImageUploadWithPreview_1 = require("@/components/common/blossoms/ImageUploadWithPreview");
// Import icons
var Event_1 = require("@mui/icons-material/Event");
var LocationOn_1 = require("@mui/icons-material/LocationOn");
var Description_1 = require("@mui/icons-material/Description");
var AccessTime_1 = require("@mui/icons-material/AccessTime");
var Public_1 = require("@mui/icons-material/Public");
dayjs_1["default"].extend(utc_1["default"]);
dayjs_1["default"].extend(timezone_1["default"]);
function EventDialogTemplate() {
    var t = react_i18next_1.useTranslation().t;
    var _a = react_1.useState(false), open = _a[0], setOpen = _a[1];
    var _b = react_1.useState(dayjs_1["default"].tz.guess()), timezone = _b[0], setTimezone = _b[1];
    var _c = react_1.useState(""), preview = _c[0], setPreview = _c[1];
    var _d = react_1.useState(false), loading = _d[0], setLoading = _d[1];
    var activeUser = nostr_hooks_1.useActiveUser().activeUser;
    var _e = react_1.useState(null), eventImage = _e[0], setEventImage = _e[1];
    var uploadFile = useBlossomUpload_1.useBlossomUpload().uploadFile;
    var showSnackbar = SnackbarContext_1.useSnackbar().showSnackbar;
    var handleImageUploaded = function (imageUrl) {
        setEventImage(imageUrl);
        showSnackbar(t("event.createEvent.imageUpload.success"), "success");
    };
    var handleImageRemoved = function () {
        setEventImage(null);
    };
    if (activeUser === undefined || activeUser === null)
        return "";
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
                                    React.createElement(ImageUploadWithPreview_1["default"], { initialPreview: eventImage || "", onImageUploaded: handleImageUploaded, onImageRemoved: handleImageRemoved, uploadFunction: uploadFile, showControls: true })),
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
