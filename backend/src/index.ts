import dotenv from "dotenv";
dotenv.config()
import Groq from "groq-sdk";
import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import { basePrompt as NodePrompt } from "./defaults/node";
import { basePrompt as ReactPrompt } from "./defaults/react";
import express from "express";
import cors from "cors"
const app = express();
app.use(express.json())

app.use(cors())
const MY_GROQ_API_KEY=process.env.GROQ_AI_KEY
const groq = new Groq({ apiKey: MY_GROQ_API_KEY });

async function fetchTemplate(req:any, res:any) {
    const prompt = req.body.prompt;
    const template_resp = await groq.chat.completions.create({
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
    const answer = template_resp.choices[0].message.content
    if (answer?.toLowerCase() === "react") {
        return res.json({
            prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${ReactPrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            userPromps:[ReactPrompt]
        })
    }
    if (answer?.toLowerCase() === "node") {
        return res.json({
            prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${NodePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            userPrompts: [NodePrompt]
        })
    }
    return res.json({
            prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${ReactPrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            userPromps:[ReactPrompt]
        })
}
app.post("/api/template", fetchTemplate)


async function chatEndpoint(req:any, res:any) {
    const messages = req.body.messages;
    const response  =  await groq.chat.completions.create({
        messages: [
            {
                role: "system",
                content: getSystemPrompt()
            },
            ...messages,
        ],
        model: "llama-3.3-70b-versatile",
        // response_format: { type: "json_object" },
        temperature: 0,
        max_tokens:8192,
        // stream:true // Streaming of incoming data which is not in json format for now
    });
    console.log("RESPONSE", response.choices[0].message.content)
    return res.json({message:"Processesd!!", code:response.choices[0].message.content ?? "Not able to create the website"})
}
app.post("/api/chat", chatEndpoint)

export async function main() {
  const chatstream = await getGroqChatCompletion();
  // Print the completion returned by the LLM.
    for await (const chunk of chatstream) {
      console.log(chunk.choices[0].delta?.content || "")
  }
}



export async function getGroqChatCompletion() {
    return groq.chat.completions.create({
        messages: [
            {
                role: "system",
                content: getSystemPrompt()
            },
            {
                role: "user",
                content: "Write a simple todo application",
            },
        ],
        model: "llama-3.3-70b-versatile",
        // response_format: { type: "json_object" },
        temperature: 1,
        max_tokens:6270,
        stream:true // Streaming of incoming data which is not in json format for now
    });
}

// main()

app.listen(8080)