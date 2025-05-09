"use strict";
exports.__esModule = true;
var React = require("react");
var Button_1 = require("@mui/material/Button");
var TextField_1 = require("@mui/material/TextField");
var Dialog_1 = require("@mui/material/Dialog");
var DialogActions_1 = require("@mui/material/DialogActions");
var DialogContent_1 = require("@mui/material/DialogContent");
var DialogContentText_1 = require("@mui/material/DialogContentText");
var DialogTitle_1 = require("@mui/material/DialogTitle");
var react_i18next_1 = require("react-i18next");
function CreateNewEventDialog(_a) {
    var event = _a.event;
    var t = react_i18next_1.useTranslation().t;
    var _b = React.useState(false), open = _b[0], setOpen = _b[1];
    var handleClickOpen = function () {
        setOpen(true);
    };
    var handleClose = function () {
        setOpen(false);
    };
    return (React.createElement(React.Fragment, null,
        React.createElement(Button_1["default"], { variant: "outlined", onClick: handleClickOpen }, "Open form dialog"),
        React.createElement(Dialog_1["default"], { open: open, onClose: handleClose, slotProps: {
                paper: {
                    component: "form",
                    onSubmit: function (event) {
                        event.preventDefault();
                        var formData = new FormData(event.currentTarget);
                        var formJson = Object.fromEntries(formData.entries());
                        var email = formJson.email;
                        console.log(email);
                        handleClose();
                    }
                }
            } },
            React.createElement(DialogTitle_1["default"], null, t("event.createEvent.title")),
            React.createElement(DialogContent_1["default"], null,
                React.createElement(DialogContentText_1["default"], null, "To subscribe to this website, please enter your email address here. We will send updates occasionally."),
                React.createElement(TextField_1["default"], { autoFocus: true, required: true, margin: "dense", id: "name", name: "email", label: "Email Address", type: "email", fullWidth: true, variant: "standard" })),
            React.createElement(DialogActions_1["default"], null,
                React.createElement(Button_1["default"], { onClick: handleClose }, "Cancel"),
                React.createElement(Button_1["default"], { type: "submit" }, "Subscribe")))));
}
exports["default"] = CreateNewEventDialog;
