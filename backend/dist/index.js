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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
exports.getGroqChatCompletion = getGroqChatCompletion;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const prompts_1 = require("./prompts");
const node_1 = require("./defaults/node");
const react_1 = require("./defaults/react");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const MY_GROQ_API_KEY = process.env.GROQ_AI_KEY;
const groq = new groq_sdk_1.default({ apiKey: MY_GROQ_API_KEY });
function fetchTemplate(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const prompt = req.body.prompt;
        const template_resp = yield groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Return whether the user prompt is asking for react js or node js project. Return only one string either node or react. kindly do not give anything extra to me"
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0,
            max_tokens: 8192,
            // stream:true // Streaming of incoming data which is not in json format for now
        });
        console.log("RESP", template_resp);
        const answer = template_resp.choices[0].message.content;
        if ((answer === null || answer === void 0 ? void 0 : answer.toLowerCase()) === "react") {
            return res.json({
                prompts: [prompts_1.BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${react_1.basePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
                userPromps: [react_1.basePrompt]
            });
        }
        if ((answer === null || answer === void 0 ? void 0 : answer.toLowerCase()) === "node") {
            return res.json({
                prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${node_1.basePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
                userPrompts: [node_1.basePrompt]
            });
        }
        return res.json({
            prompts: [prompts_1.BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${react_1.basePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            userPromps: [react_1.basePrompt]
        });
    });
}
app.post("/api/template", fetchTemplate);
function chatEndpoint(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const messages = req.body.messages;
        const response = yield groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: (0, prompts_1.getSystemPrompt)()
                },
                ...messages,
            ],
            model: "llama-3.3-70b-versatile",
            // response_format: { type: "json_object" },
            temperature: 0,
            max_tokens: 8192,
            // stream:true // Streaming of incoming data which is not in json format for now
        });
        console.log("RESPONSE", response.choices[0].message.content);
        return res.json({ message: "Processesd!!", code: (_a = response.choices[0].message.content) !== null && _a !== void 0 ? _a : "Not able to create the website" });
    });
}
app.post("/api/chat", chatEndpoint);
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, e_1, _b, _c;
        var _d;
        const chatstream = yield getGroqChatCompletion();
        try {
            // Print the completion returned by the LLM.
            for (var _e = true, chatstream_1 = __asyncValues(chatstream), chatstream_1_1; chatstream_1_1 = yield chatstream_1.next(), _a = chatstream_1_1.done, !_a; _e = true) {
                _c = chatstream_1_1.value;
                _e = false;
                const chunk = _c;
                console.log(((_d = chunk.choices[0].delta) === null || _d === void 0 ? void 0 : _d.content) || "");
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_e && !_a && (_b = chatstream_1.return)) yield _b.call(chatstream_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    });
}
function getGroqChatCompletion() {
    return __awaiter(this, void 0, void 0, function* () {
        return groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: (0, prompts_1.getSystemPrompt)()
                },
                {
                    role: "user",
                    content: "Write a simple todo application",
                },
            ],
            model: "llama-3.3-70b-versatile",
            // response_format: { type: "json_object" },
            temperature: 1,
            max_tokens: 6270,
            stream: true // Streaming of incoming data which is not in json format for now
        });
    });
}
// main()
app.listen(8080);
