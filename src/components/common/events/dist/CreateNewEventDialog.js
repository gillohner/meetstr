"use strict";
exports.__esModule = true;
// src/components/common/events/CreateNewEventDialog.tsx
var React = require("react");
var react_1 = require("react");
var Button_1 = require("@mui/material/Button");
var Dialog_1 = require("@mui/material/Dialog");
var DialogContent_1 = require("@mui/material/DialogContent");
var DialogTitle_1 = require("@mui/material/DialogTitle");
var dayjs_1 = require("dayjs");
var utc_1 = require("dayjs/plugin/utc");
var timezone_1 = require("dayjs/plugin/timezone");
var material_1 = require("@mui/material");
var react_i18next_1 = require("react-i18next");
var Divider_1 = require("@mui/material/Divider");
var Typography_1 = require("@mui/material/Typography");
var useBlossomUpload_1 = require("@/hooks/useBlossomUpload");
var nostr_hooks_1 = require("nostr-hooks");
var SnackbarContext_1 = require("@/context/SnackbarContext");
var ImageUploadWithPreview_1 = require("@/components/common/blossoms/ImageUploadWithPreview");
var FormTextField_1 = require("@/components/common/form/FormTextField");
var DateTimeSection_1 = require("@/components/common/events/DateTimeSection");
var DialogActionsSection_1 = require("@/components/common/layout/DialogActionsSection");
// Import icons
var Event_1 = require("@mui/icons-material/Event");
var LocationOn_1 = require("@mui/icons-material/LocationOn");
var Description_1 = require("@mui/icons-material/Description");
dayjs_1["default"].extend(utc_1["default"]);
dayjs_1["default"].extend(timezone_1["default"]);
function CreateNewEventDialog() {
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
        React.createElement(Button_1["default"], { size: "large", variant: "contained", onClick: function () { return setOpen(true); }, sx: { width: "100%" } }, t("event.createEvent.title")),
        React.createElement(Dialog_1["default"], { open: open, onClose: function () { return setOpen(false); }, maxWidth: "md", fullWidth: true },
            React.createElement(DialogTitle_1["default"], { sx: { bgcolor: "background.default", color: "text.primary" } },
                React.createElement(Typography_1["default"], { variant: "h5", component: "div" },
                    React.createElement(Event_1["default"], { sx: { mr: 1, verticalAlign: "middle", color: "primary.main" } }),
                    t("event.createEvent.newEvent"))),
            React.createElement(DialogContent_1["default"], { sx: { bgcolor: "background.paper" } },
                React.createElement("form", null,
                    React.createElement(material_1.Grid, { container: true, spacing: 2, direction: "row", sx: { marginTop: 1 } },
                        React.createElement(material_1.Grid, { size: { xs: 12, md: 6 } },
                            " ",
                            React.createElement(material_1.Grid, { container: true, spacing: 2, direction: "column" },
                                React.createElement(material_1.Grid, { size: { xs: 12, md: 6 } },
                                    React.createElement(FormTextField_1["default"], { label: t("event.createEvent.form.title"), name: "title", icon: React.createElement(Event_1["default"], { color: "primary" }), required: true })),
                                React.createElement(material_1.Grid, { size: 12 },
                                    React.createElement(FormTextField_1["default"], { label: t("event.createEvent.form.description"), name: "description", icon: React.createElement(Description_1["default"], { color: "primary" }), multiline: true })))),
                        React.createElement(material_1.Grid, { size: { xs: 12, md: 6 } },
                            React.createElement(material_1.Grid, { container: true, spacing: 2.5, direction: "column" },
                                React.createElement(material_1.Grid, { size: 12 },
                                    React.createElement(ImageUploadWithPreview_1["default"], { initialPreview: eventImage || "", onImageUploaded: handleImageUploaded, onImageRemoved: handleImageRemoved, uploadFunction: uploadFile })),
                                React.createElement(material_1.Grid, { size: 12 },
                                    React.createElement(FormTextField_1["default"], { label: t("event.createEvent.form.location"), name: "location", icon: React.createElement(LocationOn_1["default"], { color: "primary" }) })))),
                        React.createElement(material_1.Grid, { size: 12 },
                            React.createElement(DateTimeSection_1["default"], { timezone: timezone, onTimezoneChange: setTimezone }))),
                    React.createElement(Divider_1["default"], { sx: { my: 3, borderColor: "divider" } }),
                    React.createElement(DialogActionsSection_1["default"], { onCancel: function () { return setOpen(false); }, submitLabel: t("event.createEvent.submit") }))))));
}
exports["default"] = CreateNewEventDialog;
