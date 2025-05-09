// src/components/common/auth/NostrLogin/LoginButton.tsx
"use client";
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
var react_1 = require("react");
var Button_1 = require("@mui/material/Button");
var Box_1 = require("@mui/material/Box");
var Typography_1 = require("@mui/material/Typography");
var Modal_1 = require("@mui/material/Modal");
var TextField_1 = require("@mui/material/TextField");
var react_i18next_1 = require("react-i18next");
var nostr_hooks_1 = require("nostr-hooks");
var material_1 = require("@mui/material");
var nostr_hooks_2 = require("nostr-hooks");
var nostr_hooks_3 = require("nostr-hooks");
var style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    textAlign: "center"
};
function LoginButton(_a) {
    var _this = this;
    var _b = _a.variant, variant = _b === void 0 ? "contained" : _b, _c = _a.color, color = _c === void 0 ? "primary" : _c, _d = _a.errorColor, errorColor = _d === void 0 ? "error" : _d;
    var t = react_i18next_1.useTranslation().t;
    var _e = react_1.useState(false), open = _e[0], setOpen = _e[1];
    var _f = react_1.useState(""), remoteSignerKey = _f[0], setRemoteSignerKey = _f[1];
    var _g = react_1.useState(""), privateKey = _g[0], setPrivateKey = _g[1];
    var _h = react_1.useState(""), errorMessage = _h[0], setErrorMessage = _h[1];
    var activeUser = nostr_hooks_2.useActiveUser().activeUser;
    var userProfile = nostr_hooks_3.useProfile({ pubkey: activeUser === null || activeUser === void 0 ? void 0 : activeUser.pubkey });
    var handleOpen = function () { return setOpen(true); };
    var handleClose = function () {
        setOpen(false);
        setErrorMessage("");
    };
    var _j = nostr_hooks_1.useLogin(), loginWithExtension = _j.loginWithExtension, loginWithRemoteSigner = _j.loginWithRemoteSigner, loginWithPrivateKey = _j.loginWithPrivateKey;
    var handleLoginWithRemoteSigner = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, loginWithRemoteSigner(remoteSignerKey)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    setErrorMessage(t("error.remoteSignerFailure"));
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleLoginWithPrivateKey = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, loginWithPrivateKey(privateKey)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    setErrorMessage(t("error.invalidPrivateKey"));
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    if ((userProfile === null || userProfile === void 0 ? void 0 : userProfile.status) == "loading") {
        return (react_1["default"].createElement(Button_1["default"], { disabled: true, variant: variant, color: color }, t("navbar.login.loading")));
    }
    if ((userProfile === null || userProfile === void 0 ? void 0 : userProfile.status) == "not-found") {
        return (react_1["default"].createElement(Button_1["default"], { disabled: true, variant: variant, color: errorColor }, t("navbar.login.not-found")));
    }
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement(Button_1["default"], { variant: variant, color: color, onClick: handleOpen }, t("navbar.login.login")),
        react_1["default"].createElement(Modal_1["default"], { open: open, onClose: handleClose, "aria-labelledby": "modal-modal-title", "aria-describedby": "modal-modal-description" },
            react_1["default"].createElement(Box_1["default"], { sx: style },
                react_1["default"].createElement(Typography_1["default"], { id: "modal-modal-title", variant: "h6", component: "h2", marginBottom: 2 }, t("modal.login.title")),
                react_1["default"].createElement(Button_1["default"], { variant: variant, color: color, onClick: loginWithExtension }, t("modal.login.extension")),
                react_1["default"].createElement(material_1.Divider, { sx: { my: 2 } }),
                react_1["default"].createElement(TextField_1["default"], { label: t("modal.login.remoteSignerInput"), variant: "outlined", fullWidth: true, value: remoteSignerKey, onChange: function (e) { return setRemoteSignerKey(e.target.value); }, sx: { mb: 2 } }),
                react_1["default"].createElement(Button_1["default"], { variant: variant, color: color, onClick: handleLoginWithRemoteSigner }, t("modal.login.remoteSigner")),
                react_1["default"].createElement(material_1.Divider, { sx: { my: 2 } }),
                react_1["default"].createElement(TextField_1["default"], { label: t("modal.login.privateKeyInput"), variant: "outlined", fullWidth: true, value: privateKey, onChange: function (e) { return setPrivateKey(e.target.value); }, sx: { mb: 2 } }),
                react_1["default"].createElement(Button_1["default"], { variant: variant, color: color, onClick: handleLoginWithPrivateKey }, t("modal.login.privateKey")),
                errorMessage && (react_1["default"].createElement(Typography_1["default"], { color: "error", sx: { mt: 2 } }, errorMessage))))));
}
exports["default"] = LoginButton;
