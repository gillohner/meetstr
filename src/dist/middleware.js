"use strict";
exports.__esModule = true;
exports.middleware = void 0;
// middleware.ts
var server_1 = require("next/server");
function middleware(request) {
  var _a, _b, _c;
  var lang =
    ((_a = request.cookies.get("lang")) === null || _a === void 0 ? void 0 : _a.value) ||
    ((_b = request.cookies.get("i18next")) === null || _b === void 0 ? void 0 : _b.value) || // Also check i18next cookie
    ((_c = request.headers.get("accept-language")) === null || _c === void 0
      ? void 0
      : _c.split(",")[0].split("-")[0]) ||
    "en";
  var response = server_1.NextResponse.next();
  // Set language header for server components
  response.headers.set("x-lang", lang);
  // Ensure both cookies exist for consistency
  if (!request.cookies.has("lang")) {
    response.cookies.set("lang", lang, { path: "/" });
  }
  if (!request.cookies.has("i18next")) {
    response.cookies.set("i18next", lang, { path: "/" });
  }
  return response;
}
exports.middleware = middleware;
