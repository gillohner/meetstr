"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
var Box_1 = require("@mui/material/Box");
var Paper_1 = require("@mui/material/Paper");
var Divider_1 = require("@mui/material/Divider");
var Typography_1 = require("@mui/material/Typography");
var useBlossomUpload_1 = require("@/hooks/useBlossomUpload");
var nostr_hooks_1 = require("nostr-hooks");
var material_1 = require("@mui/material");
var SnackbarContext_1 = require("@/context/SnackbarContext");
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
    var _this = this;
    var t = react_i18next_1.useTranslation().t;
    var _a = react_1.useState(false), open = _a[0], setOpen = _a[1];
    var _b = react_1.useState(dayjs_1["default"].tz.guess()), timezone = _b[0], setTimezone = _b[1];
    var _c = react_1.useState(""), preview = _c[0], setPreview = _c[1];
    var _d = react_1.useState(false), loading = _d[0], setLoading = _d[1];
    var activeUser = nostr_hooks_1.useActiveUser().activeUser;
    var uploadFile = useBlossomUpload_1.useBlossomUpload().uploadFile;
    var _e = react_1.useState(null), fileUrl = _e[0], setFileUrl = _e[1];
    var showSnackbar = SnackbarContext_1.useSnackbar().showSnackbar;
    var handleFileChange = function (event) { return __awaiter(_this, void 0, void 0, function () {
        var file, localPreview, imageUrl, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    file = (_a = event.target.files) === null || _a === void 0 ? void 0 : _a[0];
                    if (!file)
                        return [2 /*return*/];
                    // Reset previous preview
                    setPreview("");
                    setLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    localPreview = URL.createObjectURL(file);
                    setPreview(localPreview);
                    return [4 /*yield*/, uploadFile(file)];
                case 2:
                    imageUrl = _b.sent();
                    if (imageUrl === "error" || !imageUrl) {
                        throw new Error("Upload failed");
                    }
                    // Update preview with actual URL from server
                    setPreview(imageUrl);
                    // Log success
                    console.log("Image uploaded successfully:", imageUrl);
                    // Show success message
                    showSnackbar(t("event.createEvent.imageUpload.success"), "success");
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _b.sent();
                    console.error("Upload failed:", error_1);
                    showSnackbar(t("event.createEvent.imageUpload.error"), "error");
                    // Clear preview on error
                    setPreview("");
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
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
                                    React.createElement(Box_1["default"], { sx: { display: "flex", flexDirection: "column", alignItems: "center" } },
                                        React.createElement(Button_1["default"], { component: "label", variant: "outlined", fullWidth: true, startIcon: loading ? React.createElement(material_1.CircularProgress, { size: 20 }) : React.createElement(Image_1["default"], { color: "primary" }), sx: { mb: 2, color: "primary.main", borderColor: "primary.main" }, disabled: loading },
                                            loading
                                                ? t("event.createEvent.imageUpload.uploading")
                                                : t("event.createEvent.imageUpload.upload"),
                                            React.createElement("input", { type: "file", accept: "image/*", hidden: true, onChange: handleFileChange, disabled: loading })),
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
