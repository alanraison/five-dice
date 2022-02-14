var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[Object.keys(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// ../../node_modules/@remix-run/dev/compiler/shims/react.ts
var React;
var init_react = __esm({
  "../../node_modules/@remix-run/dev/compiler/shims/react.ts"() {
    React = __toModule(require("react"));
  }
});

// ../../node_modules/remix/client.js
var require_client = __commonJS({
  "../../node_modules/remix/client.js"(exports) {
    init_react();
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var react = require("@remix-run/react");
    Object.defineProperty(exports, "Form", {
      enumerable: true,
      get: function() {
        return react.Form;
      }
    });
    Object.defineProperty(exports, "Link", {
      enumerable: true,
      get: function() {
        return react.Link;
      }
    });
    Object.defineProperty(exports, "Links", {
      enumerable: true,
      get: function() {
        return react.Links;
      }
    });
    Object.defineProperty(exports, "LiveReload", {
      enumerable: true,
      get: function() {
        return react.LiveReload;
      }
    });
    Object.defineProperty(exports, "Meta", {
      enumerable: true,
      get: function() {
        return react.Meta;
      }
    });
    Object.defineProperty(exports, "NavLink", {
      enumerable: true,
      get: function() {
        return react.NavLink;
      }
    });
    Object.defineProperty(exports, "Outlet", {
      enumerable: true,
      get: function() {
        return react.Outlet;
      }
    });
    Object.defineProperty(exports, "PrefetchPageLinks", {
      enumerable: true,
      get: function() {
        return react.PrefetchPageLinks;
      }
    });
    Object.defineProperty(exports, "RemixBrowser", {
      enumerable: true,
      get: function() {
        return react.RemixBrowser;
      }
    });
    Object.defineProperty(exports, "RemixServer", {
      enumerable: true,
      get: function() {
        return react.RemixServer;
      }
    });
    Object.defineProperty(exports, "Scripts", {
      enumerable: true,
      get: function() {
        return react.Scripts;
      }
    });
    Object.defineProperty(exports, "ScrollRestoration", {
      enumerable: true,
      get: function() {
        return react.ScrollRestoration;
      }
    });
    Object.defineProperty(exports, "useActionData", {
      enumerable: true,
      get: function() {
        return react.useActionData;
      }
    });
    Object.defineProperty(exports, "useBeforeUnload", {
      enumerable: true,
      get: function() {
        return react.useBeforeUnload;
      }
    });
    Object.defineProperty(exports, "useCatch", {
      enumerable: true,
      get: function() {
        return react.useCatch;
      }
    });
    Object.defineProperty(exports, "useFetcher", {
      enumerable: true,
      get: function() {
        return react.useFetcher;
      }
    });
    Object.defineProperty(exports, "useFetchers", {
      enumerable: true,
      get: function() {
        return react.useFetchers;
      }
    });
    Object.defineProperty(exports, "useFormAction", {
      enumerable: true,
      get: function() {
        return react.useFormAction;
      }
    });
    Object.defineProperty(exports, "useHref", {
      enumerable: true,
      get: function() {
        return react.useHref;
      }
    });
    Object.defineProperty(exports, "useLoaderData", {
      enumerable: true,
      get: function() {
        return react.useLoaderData;
      }
    });
    Object.defineProperty(exports, "useLocation", {
      enumerable: true,
      get: function() {
        return react.useLocation;
      }
    });
    Object.defineProperty(exports, "useMatches", {
      enumerable: true,
      get: function() {
        return react.useMatches;
      }
    });
    Object.defineProperty(exports, "useNavigate", {
      enumerable: true,
      get: function() {
        return react.useNavigate;
      }
    });
    Object.defineProperty(exports, "useNavigationType", {
      enumerable: true,
      get: function() {
        return react.useNavigationType;
      }
    });
    Object.defineProperty(exports, "useOutlet", {
      enumerable: true,
      get: function() {
        return react.useOutlet;
      }
    });
    Object.defineProperty(exports, "useOutletContext", {
      enumerable: true,
      get: function() {
        return react.useOutletContext;
      }
    });
    Object.defineProperty(exports, "useParams", {
      enumerable: true,
      get: function() {
        return react.useParams;
      }
    });
    Object.defineProperty(exports, "useResolvedPath", {
      enumerable: true,
      get: function() {
        return react.useResolvedPath;
      }
    });
    Object.defineProperty(exports, "useSearchParams", {
      enumerable: true,
      get: function() {
        return react.useSearchParams;
      }
    });
    Object.defineProperty(exports, "useSubmit", {
      enumerable: true,
      get: function() {
        return react.useSubmit;
      }
    });
    Object.defineProperty(exports, "useTransition", {
      enumerable: true,
      get: function() {
        return react.useTransition;
      }
    });
  }
});

// ../../node_modules/remix/server.js
var require_server = __commonJS({
  "../../node_modules/remix/server.js"(exports) {
    init_react();
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var serverRuntime = require("@remix-run/server-runtime");
    Object.defineProperty(exports, "createCookie", {
      enumerable: true,
      get: function() {
        return serverRuntime.createCookie;
      }
    });
    Object.defineProperty(exports, "createCookieSessionStorage", {
      enumerable: true,
      get: function() {
        return serverRuntime.createCookieSessionStorage;
      }
    });
    Object.defineProperty(exports, "createMemorySessionStorage", {
      enumerable: true,
      get: function() {
        return serverRuntime.createMemorySessionStorage;
      }
    });
    Object.defineProperty(exports, "createSession", {
      enumerable: true,
      get: function() {
        return serverRuntime.createSession;
      }
    });
    Object.defineProperty(exports, "createSessionStorage", {
      enumerable: true,
      get: function() {
        return serverRuntime.createSessionStorage;
      }
    });
    Object.defineProperty(exports, "isCookie", {
      enumerable: true,
      get: function() {
        return serverRuntime.isCookie;
      }
    });
    Object.defineProperty(exports, "isSession", {
      enumerable: true,
      get: function() {
        return serverRuntime.isSession;
      }
    });
    Object.defineProperty(exports, "json", {
      enumerable: true,
      get: function() {
        return serverRuntime.json;
      }
    });
    Object.defineProperty(exports, "redirect", {
      enumerable: true,
      get: function() {
        return serverRuntime.redirect;
      }
    });
  }
});

// ../../node_modules/remix/platform.js
var require_platform = __commonJS({
  "../../node_modules/remix/platform.js"(exports) {
    init_react();
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var node = require("@remix-run/node");
    Object.defineProperty(exports, "createFileSessionStorage", {
      enumerable: true,
      get: function() {
        return node.createFileSessionStorage;
      }
    });
    Object.defineProperty(exports, "unstable_createFileUploadHandler", {
      enumerable: true,
      get: function() {
        return node.unstable_createFileUploadHandler;
      }
    });
    Object.defineProperty(exports, "unstable_createMemoryUploadHandler", {
      enumerable: true,
      get: function() {
        return node.unstable_createMemoryUploadHandler;
      }
    });
    Object.defineProperty(exports, "unstable_parseMultipartFormData", {
      enumerable: true,
      get: function() {
        return node.unstable_parseMultipartFormData;
      }
    });
  }
});

// ../../node_modules/remix/index.js
var require_remix = __commonJS({
  "../../node_modules/remix/index.js"(exports) {
    init_react();
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var client = require_client();
    var server = require_server();
    var platform = require_platform();
    Object.keys(client).forEach(function(k) {
      if (k !== "default" && !exports.hasOwnProperty(k))
        Object.defineProperty(exports, k, {
          enumerable: true,
          get: function() {
            return client[k];
          }
        });
    });
    Object.keys(server).forEach(function(k) {
      if (k !== "default" && !exports.hasOwnProperty(k))
        Object.defineProperty(exports, k, {
          enumerable: true,
          get: function() {
            return server[k];
          }
        });
    });
    Object.keys(platform).forEach(function(k) {
      if (k !== "default" && !exports.hasOwnProperty(k))
        Object.defineProperty(exports, k, {
          enumerable: true,
          get: function() {
            return platform[k];
          }
        });
    });
  }
});

// <stdin>
__export(exports, {
  assets: () => import_assets.default,
  entry: () => entry,
  routes: () => routes
});
init_react();

// app/entry.server.tsx
var entry_server_exports = {};
__export(entry_server_exports, {
  default: () => handleRequest
});
init_react();
var import_server = __toModule(require("react-dom/server"));
var import_remix = __toModule(require_remix());
function handleRequest(request, responseStatusCode, responseHeaders, remixContext) {
  let markup = (0, import_server.renderToString)(/* @__PURE__ */ React.createElement(import_remix.RemixServer, {
    context: remixContext,
    url: request.url
  }));
  responseHeaders.set("Content-Type", "text/html");
  return new Response("<!DOCTYPE html>" + markup, {
    status: responseStatusCode,
    headers: responseHeaders
  });
}

// route-module:/Users/alan/src/five-dice/packages/main/app/root.tsx
var root_exports = {};
__export(root_exports, {
  CatchBoundary: () => CatchBoundary,
  ErrorBoundary: () => ErrorBoundary,
  default: () => App,
  links: () => links
});
init_react();
var import_remix2 = __toModule(require_remix());

// app/tailwind.css
var tailwind_default = "/_static/build/_assets/tailwind-XOCECTAS.css";

// route-module:/Users/alan/src/five-dice/packages/main/app/root.tsx
function links() {
  return [{ rel: "stylesheet", href: tailwind_default }];
}
function App() {
  return /* @__PURE__ */ React.createElement(Document, null, /* @__PURE__ */ React.createElement(Layout, null, /* @__PURE__ */ React.createElement(import_remix2.Outlet, null)));
}
function ErrorBoundary({ error }) {
  console.error(error);
  return /* @__PURE__ */ React.createElement(Document, {
    title: "Error!"
  }, /* @__PURE__ */ React.createElement(Layout, null, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, "There was an error"), /* @__PURE__ */ React.createElement("p", null, error.message), /* @__PURE__ */ React.createElement("hr", null), /* @__PURE__ */ React.createElement("p", null, "Hey, developer, you should replace this with what you want your users to see."))));
}
function CatchBoundary() {
  let caught = (0, import_remix2.useCatch)();
  let message;
  switch (caught.status) {
    case 401:
      message = /* @__PURE__ */ React.createElement("p", null, "Oops! Looks like you tried to visit a page that you do not have access to.");
      break;
    case 404:
      message = /* @__PURE__ */ React.createElement("p", null, "Oops! Looks like you tried to visit a page that does not exist.");
      break;
    default:
      throw new Error(caught.data || caught.statusText);
  }
  return /* @__PURE__ */ React.createElement(Document, {
    title: `${caught.status} ${caught.statusText}`
  }, /* @__PURE__ */ React.createElement(Layout, null, /* @__PURE__ */ React.createElement("h1", null, caught.status, ": ", caught.statusText), message));
}
function Document({
  children,
  title
}) {
  return /* @__PURE__ */ React.createElement("html", {
    lang: "en"
  }, /* @__PURE__ */ React.createElement("head", null, /* @__PURE__ */ React.createElement("meta", {
    charSet: "utf-8"
  }), /* @__PURE__ */ React.createElement("meta", {
    name: "viewport",
    content: "width=device-width,initial-scale=1"
  }), /* @__PURE__ */ React.createElement("link", {
    href: "_static/favicon.ico",
    rel: "icon",
    type: "image/x-icon"
  }), title ? /* @__PURE__ */ React.createElement("title", null, title) : null, /* @__PURE__ */ React.createElement(import_remix2.Meta, null), /* @__PURE__ */ React.createElement(import_remix2.Links, null)), /* @__PURE__ */ React.createElement("body", {
    className: "box-border"
  }, children, /* @__PURE__ */ React.createElement(import_remix2.ScrollRestoration, null), /* @__PURE__ */ React.createElement(import_remix2.Scripts, null), false));
}
function Layout({ children }) {
  return /* @__PURE__ */ React.createElement("div", {
    className: "bg-purple-700 min-h-screen w-full p-2"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "max-w-md mx-auto"
  }, children));
}

// route-module:/Users/alan/src/five-dice/packages/main/app/routes/$gameId.join.tsx
var gameId_join_exports = {};
__export(gameId_join_exports, {
  action: () => action,
  default: () => JoinGame,
  links: () => links2,
  loader: () => loader
});
init_react();
var import_classnames = __toModule(require("classnames"));
var import_random_word_slugs = __toModule(require("random-word-slugs"));
var import_react = __toModule(require("react"));
var import_remix4 = __toModule(require_remix());

// app/api/game.ts
init_react();
var import_client_dynamodb = __toModule(require("@aws-sdk/client-dynamodb"));
var ddb = new import_client_dynamodb.DynamoDBClient({ endpoint: process.env.DYNAMO_ENDPOINT });
var table = process.env.TABLE_NAME;
if (!table) {
  throw new Error("Initialisation error: TABLE_NAME not found");
}
async function gameExists(gameId) {
  if (!gameId) {
    return false;
  }
  const result = await ddb.send(new import_client_dynamodb.GetItemCommand({
    TableName: table,
    Key: {
      PK: { S: `GAME#${gameId}` }
    }
  }));
  return !!result.Item;
}
async function nameTaken(gameId, name) {
  var _a, _b, _c;
  const result = await ddb.send(new import_client_dynamodb.GetItemCommand({
    TableName: process.env.TABLE_NAME,
    Key: {
      PK: { S: `GAME#${gameId}` }
    },
    ProjectionExpression: "#players",
    ExpressionAttributeNames: {
      "#players": "Players"
    }
  }));
  return (_c = (_b = (_a = result.Item) == null ? void 0 : _a.Players) == null ? void 0 : _b.SS) == null ? void 0 : _c.includes(name);
}

// app/components/CharacterCarousel.tsx
init_react();
var allCharacters = [
  "alien1",
  "alien2",
  "alien3",
  "alien4",
  "alien5",
  "alien6",
  "alien7",
  "alien8",
  "alien9",
  "alien10",
  "alien11",
  "alien12",
  "alien13",
  "alien14",
  "alien15",
  "alien16"
];
function CharacterCarousel({
  character,
  onChange,
  className
}) {
  const index = allCharacters.indexOf(character);
  if (index === -1) {
    throw new Error("invalid character id");
  }
  const handleChange = (newIndex) => {
    onChange(allCharacters[(newIndex + allCharacters.length) % allCharacters.length]);
  };
  return /* @__PURE__ */ React.createElement("div", {
    className
  }, /* @__PURE__ */ React.createElement("button", {
    className: "rounded-full bg-white h-12 w-12 hover:shadow-md opacity-50 hover:opacity-100 -mr-4 z-40 hover:z-40 my-auto inline",
    onClick: () => handleChange(index - 1)
  }, "<"), /* @__PURE__ */ React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    className: "w-28 z-20 inline",
    viewBox: "0 0 150 140"
  }, allCharacters.map((c, i) => {
    const length = allCharacters.length;
    return /* @__PURE__ */ React.createElement("use", {
      className: "transition-transform duration-1000",
      key: c,
      transform: `translate(${((length / 2 + length + i - index) % length - length / 2) * 150} 0)`,
      href: `/_static/images/characters.svg#${c}`,
      display: Math.abs(i - index) % (length - 1) > 1 ? "none" : "display"
    });
  })), /* @__PURE__ */ React.createElement("button", {
    className: "rounded-full bg-white h-12 w-12 hover:shadow-md opacity-50 hover:opacity-100 -ml-4 z-40 inline",
    onClick: () => handleChange(index + 1)
  }, ">"));
}

// app/session.ts
init_react();
var import_remix3 = __toModule(require_remix());
var { getSession, commitSession, destroySession } = (0, import_remix3.createCookieSessionStorage)({
  cookie: {
    name: "__five_dice",
    sameSite: "strict",
    httpOnly: true
  }
});

// app/logger.ts
init_react();
var import_pino = __toModule(require("pino"));
var logger = (0, import_pino.default)();
var logger_default = logger;

// route-module:/Users/alan/src/five-dice/packages/main/app/routes/$gameId.join.tsx
function links2() {
  return [
    {
      rel: "preload",
      href: "/_static/images/characters.svg",
      as: "image",
      type: "image/svg+xml"
    }
  ];
}
async function action({ params, request }) {
  const { gameId } = params;
  const formData = await request.formData();
  if (!gameId) {
    throw new Error("no game id found");
  }
  const character = formData.get("character");
  if (!character) {
    logger_default.debug(params);
    throw new Error("no character found");
  }
  const name = formData.get("name");
  if (!name) {
    return {
      name: "A name must be supplied"
    };
  }
  if (await nameTaken(gameId, name.toString())) {
    return {
      name: "That name has already been used in this game"
    };
  }
  const session = await getSession(request.headers.get("Cookie"));
  session.flash("name", name.toString());
  session.flash("character", character.toString());
  return (0, import_remix4.redirect)(`/${encodeURIComponent(gameId)}`, {
    headers: {
      "Set-Cookie": await commitSession(session)
    }
  });
}
async function loader() {
  return {
    name: (0, import_random_word_slugs.generateSlug)(2, {
      format: "title",
      partsOfSpeech: ["adjective", "noun"]
    }),
    characterId: Math.floor(65 * Math.random()) % 16
  };
}
function JoinGame() {
  const errors = (0, import_remix4.useActionData)();
  const { name: defaultName, characterId } = (0, import_remix4.useLoaderData)();
  const [name, setName] = (0, import_react.useState)(defaultName);
  const [character, setCharacter] = (0, import_react.useState)(allCharacters[characterId]);
  return /* @__PURE__ */ React.createElement("main", {
    className: "bg-yellow-300 rounded-3xl border-black border-8 p-8"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "uppercase"
  }, "Welcome!"), "Please tell me your name and choose a character", /* @__PURE__ */ React.createElement("div", {
    className: "w-full"
  }, /* @__PURE__ */ React.createElement("input", {
    className: (0, import_classnames.default)("bg-white", "mx-auto", "block", "p-2", {
      "bg-red-300": errors == null ? void 0 : errors.name
    }),
    name: "name",
    value: name,
    placeholder: "Your Name",
    onChange: (e) => setName(e.target.value)
  }), /* @__PURE__ */ React.createElement(CharacterCarousel, {
    character,
    onChange: setCharacter,
    className: "w-max mx-auto"
  })), /* @__PURE__ */ React.createElement(import_remix4.Form, {
    method: "post"
  }, /* @__PURE__ */ React.createElement("input", {
    type: "hidden",
    name: "name",
    value: name
  }), /* @__PURE__ */ React.createElement("input", {
    type: "hidden",
    name: "character",
    value: character
  }), /* @__PURE__ */ React.createElement("div", {
    className: "flex"
  }, /* @__PURE__ */ React.createElement("button", {
    className: "flex-1 m-2 p-2 bg-green-300 border-8 border-black rounded-xl",
    type: "submit"
  }, "Let's go!"), /* @__PURE__ */ React.createElement(import_remix4.Link, {
    to: "/",
    className: "flex-initial m-2 p-2 border-8 border-black rounded-xl"
  }, "Back"))));
}

// route-module:/Users/alan/src/five-dice/packages/main/app/routes/$gameId.tsx
var gameId_exports = {};
__export(gameId_exports, {
  default: () => Game,
  links: () => links3,
  loader: () => loader2
});
init_react();
var import_remix6 = __toModule(require_remix());

// app/components/Lobby.tsx
init_react();
var import_classnames2 = __toModule(require("classnames"));
var import_remix5 = __toModule(require_remix());
function Lobby({ players, player }) {
  const { gameId } = (0, import_remix5.useParams)();
  const otherPlayers = players.filter((p) => p.name !== player.name);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", {
    className: "text-3xl uppercase"
  }, "Waiting for Players"), /* @__PURE__ */ React.createElement("div", {
    className: "p-2"
  }, "Game Code:", " ", /* @__PURE__ */ React.createElement("input", {
    className: "bg-green-300 p-2 w-20",
    value: gameId,
    readOnly: true
  })), /* @__PURE__ */ React.createElement("div", {
    className: "bg-white rounded-3xl border-black border-8 p-8"
  }, /* @__PURE__ */ React.createElement("ul", null, /* @__PURE__ */ React.createElement("li", {
    className: (0, import_classnames2.default)("flex", "items-center")
  }, /* @__PURE__ */ React.createElement("span", {
    className: "flex-1"
  }, player.name, " (You)"), /* @__PURE__ */ React.createElement("svg", {
    className: "w-20 h-20 ml-4 inline"
  }, /* @__PURE__ */ React.createElement("use", {
    xlinkHref: `/_static/images/characters.svg#${player.character}`
  }))), otherPlayers == null ? void 0 : otherPlayers.map((p) => /* @__PURE__ */ React.createElement("li", {
    key: p.name,
    className: "flex items-center"
  }, /* @__PURE__ */ React.createElement("svg", {
    className: "w-20 h-20 mr-4 inline"
  }, /* @__PURE__ */ React.createElement("use", {
    xlinkHref: `/_static/images/characters.svg#${p.character}`
  })), /* @__PURE__ */ React.createElement("span", {
    className: "flex-1"
  }, p.name))))), /* @__PURE__ */ React.createElement("div", {
    className: "w-full"
  }, /* @__PURE__ */ React.createElement("button", {
    className: (0, import_classnames2.default)("m-4", "p-2", "mx-auto", "w-full", "text-xl", "block", "bg-green-300", "border-8", "border-black", "rounded-xl")
  }, "Start Game"), /* @__PURE__ */ React.createElement(import_remix5.Link, {
    to: "/",
    className: (0, import_classnames2.default)("m-4", "p-2", "mx-auto", "text-xl", "block", "text-center", "border-8", "border-black", "rounded-xl")
  }, "Leave Game")));
}

// app/hooks/websocket.ts
init_react();
var import_react2 = __toModule(require("react"));
var import_zod = __toModule(require("zod"));

// app/reducers/reducer.ts
init_react();
function reducer(state, action3) {
  console.log(action3);
  switch (action3.event) {
    case "player-joined": {
      return __spreadProps(__spreadValues({}, state), {
        allPlayers: [...action3.allPlayers]
      });
    }
    case "player-left": {
      return __spreadProps(__spreadValues({}, state), {
        allPlayers: action3.allPlayers.map((name) => {
          var _a;
          return {
            name,
            character: ((_a = state.allPlayers.find((player) => player.name === name)) == null ? void 0 : _a.character) || "unknown"
          };
        })
      });
    }
    default:
      return state;
  }
}

// app/hooks/websocket.ts
var WebsocketEvent = import_zod.z.object({
  event: import_zod.z.string()
});
var PlayerJoinedEvent = WebsocketEvent.extend({
  event: import_zod.z.literal("player-joined"),
  newPlayer: import_zod.z.object({
    name: import_zod.z.string(),
    character: import_zod.z.string()
  }),
  allPlayers: import_zod.z.array(import_zod.z.object({
    name: import_zod.z.string(),
    character: import_zod.z.string()
  }))
});
var PlayerLeftEvent = WebsocketEvent.extend({
  event: import_zod.z.literal("player-left"),
  player: import_zod.z.string(),
  allPlayers: import_zod.z.array(import_zod.z.string())
});
function useWebSocket(wsUrl, gameId, player) {
  const websocket = (0, import_react2.useRef)();
  const [state, dispatch] = (0, import_react2.useReducer)(reducer, {
    state: "pending",
    allPlayers: []
  });
  (0, import_react2.useEffect)(() => {
    if (!websocket.current) {
      const url = new URL(wsUrl);
      url.searchParams.set("gameId", gameId || "");
      url.searchParams.set("name", player.name);
      url.searchParams.set("character", player.character);
      websocket.current = websocket.current || new WebSocket(url);
      websocket.current.onmessage = (messageEvent) => {
        console.log(`received ws message: ${messageEvent.data}`);
        const json2 = JSON.parse(messageEvent.data);
        const parse = WebsocketEvent.safeParse(json2);
        if (parse.success) {
          switch (parse.data.event) {
            case "player-joined":
              dispatch(PlayerJoinedEvent.parse(json2));
              break;
            case "player-left":
              dispatch(PlayerLeftEvent.parse(json2));
              break;
          }
        } else {
          console.log(parse);
        }
      };
    }
    return () => {
      var _a;
      (_a = websocket.current) == null ? void 0 : _a.close();
      websocket.current = void 0;
    };
  }, []);
  return [state, dispatch];
}

// app/reducers/context.tsx
init_react();
var import_react3 = __toModule(require("react"));
var initialState = {
  state: "pending",
  allPlayers: []
};
var Context = (0, import_react3.createContext)({
  state: initialState,
  dispatch: (a) => {
  }
});
function ReducerProvider({ children }) {
  const [state, dispatch] = (0, import_react3.useReducer)(reducer, initialState);
  return /* @__PURE__ */ React.createElement(Context.Provider, {
    value: { state, dispatch }
  }, children);
}

// route-module:/Users/alan/src/five-dice/packages/main/app/routes/$gameId.tsx
function links3() {
  return [
    {
      rel: "preload",
      href: "/_static/images/characters.svg",
      as: "image",
      type: "image/svg+xml"
    }
  ];
}
async function loader2({
  params,
  request
}) {
  const { gameId } = params;
  if (!await gameExists(gameId)) {
    throw (0, import_remix6.redirect)("/");
  }
  const session = await getSession(request.headers.get("Cookie"));
  const name = session.get("name");
  const character = session.get("character");
  if (!(name && character)) {
    (0, import_remix6.redirect)("./join");
  }
  return (0, import_remix6.json)({
    wsUrl: process.env.WS_API || "",
    name,
    character
  }, {
    headers: {
      "Set-Cookie": await commitSession(session)
    }
  });
}
function Game() {
  const { gameId } = (0, import_remix6.useParams)();
  const { wsUrl, name, character } = (0, import_remix6.useLoaderData)();
  const [state, dispatch] = useWebSocket(wsUrl, gameId || "", {
    name,
    character
  });
  return /* @__PURE__ */ React.createElement(ReducerProvider, null, /* @__PURE__ */ React.createElement("main", {
    className: "bg-yellow-300 rounded-3xl border-black border-8 p-8"
  }, (() => {
    switch (state.state) {
      case "pending":
        return /* @__PURE__ */ React.createElement(Lobby, {
          players: state.allPlayers,
          player: { name, character }
        });
      default:
        return null;
    }
  })()));
}

// route-module:/Users/alan/src/five-dice/packages/main/app/routes/index.tsx
var routes_exports = {};
__export(routes_exports, {
  action: () => action2,
  default: () => Start
});
init_react();
var import_react4 = __toModule(require("react"));
var import_remix7 = __toModule(require_remix());
var import_remix8 = __toModule(require_remix());
var import_classnames3 = __toModule(require("classnames"));

// app/api/create.ts
init_react();
var import_client_dynamodb2 = __toModule(require("@aws-sdk/client-dynamodb"));
var import_crypto = __toModule(require("crypto"));
var import_luxon = __toModule(require("luxon"));
var ddb2 = new import_client_dynamodb2.DynamoDBClient({ endpoint: process.env.DYNAMO_ENDPOINT });
var table2 = process.env.TABLE_NAME;
if (!table2) {
  throw new Error("Initialisation error: TABLE_NAME not found");
}
function nameGenerator() {
  return (0, import_crypto.randomBytes)(4).toString("base64").substring(0, 6).replace(/\+/g, "-").replace(/\//g, "_");
}
async function createGame() {
  const ttl = import_luxon.DateTime.now().plus({ days: 1 }).toSeconds().toString(10);
  for (let name = nameGenerator(), i = 0; i < 50; i += 1, name = nameGenerator()) {
    const req = new import_client_dynamodb2.PutItemCommand({
      TableName: table2,
      Item: {
        PK: { S: `GAME#${name}` },
        T: { S: "Game" },
        GSI1PK: { S: name },
        GSI1SK: { S: `GAME#${name}` },
        GID: { S: name },
        Status: { S: "Pending" },
        Ttl: {
          N: ttl
        }
      },
      ConditionExpression: "attribute_not_exists(#pk)",
      ExpressionAttributeNames: {
        "#pk": "PK"
      }
    });
    try {
      await ddb2.send(req);
      return name;
    } catch (err) {
      if (err instanceof Error && err.name === "ConditionalCheckFailedException") {
        logger_default.info({
          gameId: name,
          msg: "duplicate gameId created, trying again"
        });
      } else {
        logger_default.error({ msg: "in createGame()", err });
        throw err;
      }
    }
  }
  throw new Error("Unable to create game.");
}

// route-module:/Users/alan/src/five-dice/packages/main/app/routes/index.tsx
async function action2({
  request
}) {
  var _a;
  if (request.method !== "POST") {
    throw new Response("Method not allowed", {
      status: 405,
      statusText: "Method not allowed"
    });
  }
  const formData = await request.formData();
  switch (formData.get("type")) {
    case "new":
      try {
        const gameId2 = await createGame();
        return (0, import_remix8.redirect)(`/${encodeURIComponent(gameId2)}/join`);
      } catch (err) {
        return err;
      }
    case "join":
      const gameId = (_a = formData.get("gameId")) == null ? void 0 : _a.toString();
      if (!await gameExists(gameId)) {
        return {
          gameId: "Game not found"
        };
      }
      return (0, import_remix8.redirect)(`/${encodeURIComponent(gameId || "")}`);
    default:
      return {};
  }
}
function Start() {
  return /* @__PURE__ */ React.createElement("main", null, /* @__PURE__ */ React.createElement("h1", {
    className: "text-6xl text-white"
  }, "Five Dice"), /* @__PURE__ */ React.createElement("div", {
    className: "bg-white border-8 border-black rounded-xl w-full p-4 my-2"
  }, "Welcome to Five Dice, the online Perudo game!"), /* @__PURE__ */ React.createElement(StartGamePanel, null), /* @__PURE__ */ React.createElement(JoinGamePanel, null));
}
function StartGamePanel() {
  const { state: transitionState } = (0, import_remix7.useTransition)();
  return /* @__PURE__ */ React.createElement(import_remix7.Form, {
    method: "post"
  }, /* @__PURE__ */ React.createElement("input", {
    type: "hidden",
    name: "type",
    value: "new"
  }), /* @__PURE__ */ React.createElement("button", {
    className: (0, import_classnames3.default)("bg-yellow-300", "border-8", "border-black", "rounded-xl", "w-full", "p-4", "my-2", "text-4xl", "uppercase", "disabled:bg-yellow-500", "hover:border-green-700", "hover:text-green-700"),
    disabled: transitionState === "submitting"
  }, "Start Game"));
}
function JoinGamePanel() {
  const [gameCode, setGameCode] = (0, import_react4.useState)("");
  const errors = (0, import_remix7.useActionData)();
  return /* @__PURE__ */ React.createElement("div", {
    className: (0, import_classnames3.default)("bg-yellow-300", "border-8", "border-black", "rounded-xl", "p-4", "my-2", {
      "border-red-500": errors == null ? void 0 : errors.gameId,
      "hover:border-green-700": !(errors == null ? void 0 : errors.gameId)
    })
  }, /* @__PURE__ */ React.createElement(import_remix7.Form, {
    method: "post"
  }, /* @__PURE__ */ React.createElement("p", {
    className: "p-2 text-center"
  }, "Got a Game Code?"), /* @__PURE__ */ React.createElement("fieldset", {
    className: "mx-auto text-center"
  }, /* @__PURE__ */ React.createElement("input", {
    type: "hidden",
    name: "type",
    value: "join"
  }), /* @__PURE__ */ React.createElement("input", {
    id: "gameId",
    name: "gameId",
    placeholder: "Game Code",
    onChange: (e) => setGameCode(e.target.value),
    className: (0, import_classnames3.default)("p-2", { "bg-red-300": errors == null ? void 0 : errors.gameId })
  }), (errors == null ? void 0 : errors.gameId) ? /* @__PURE__ */ React.createElement("div", {
    className: "text-red-500"
  }, errors.gameId) : null), /* @__PURE__ */ React.createElement("button", {
    type: "submit",
    className: (0, import_classnames3.default)("text-4xl", "uppercase", "w-full", "hover:text-green-700", "disabled:text-gray-500"),
    disabled: !gameCode
  }, "Join Game")));
}

// <stdin>
var import_assets = __toModule(require("./assets.json"));
var entry = { module: entry_server_exports };
var routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: root_exports
  },
  "routes/$gameId.join": {
    id: "routes/$gameId.join",
    parentId: "root",
    path: ":gameId/join",
    index: void 0,
    caseSensitive: void 0,
    module: gameId_join_exports
  },
  "routes/$gameId": {
    id: "routes/$gameId",
    parentId: "root",
    path: ":gameId",
    index: void 0,
    caseSensitive: void 0,
    module: gameId_exports
  },
  "routes/index": {
    id: "routes/index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: routes_exports
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  assets,
  entry,
  routes
});
/**
 * @remix-run/node v1.1.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
/**
 * @remix-run/react v1.1.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
/**
 * @remix-run/server-runtime v1.1.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
/**
 * remix v1.1.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
