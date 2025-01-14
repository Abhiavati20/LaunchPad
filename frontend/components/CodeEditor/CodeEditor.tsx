"use client";
import { Editor } from "@monaco-editor/react"
import { ScrollArea } from "@radix-ui/react-scroll-area";
// import { Dispatch, SetStateAction } from "react";
// import { Button } from "../ui/button";
import { X } from "lucide-react";
interface ICodeEditorProps {
    value: string;
    language: string;
    onChange: (value: string | undefined) => void;
    tabs: { id: string, title: string }[];
    activeTab: string;
    onTabClose: (tabName: string) => void;
    onTabChange:(fileName:string) => void;

    
}
const CodeEditor = ({value, language, onChange,tabs,activeTab,onTabChange, onTabClose}:ICodeEditorProps) => {
  
    return (
        <div className="flex flex-col w-full h-full">
            <ScrollArea className="flex">{
                tabs.map((tab, index) => (
                    <div
                        className={`px-1 py-0.5 rounded-sm gap-2 border border-gray-700 flex items-center cursor-pointer text-sm ${tab.title === activeTab ? "bg-slate-600" : "bg-transparent"}`}
                        onClick={() => onTabChange(tab.title)}
                        key={index}
                    >
                        {tab.title}
                        <X size={12} onClick={() => onTabClose(tab.title)} />
        
                    </div>
                ))}
            </ScrollArea>
            <Editor
                height="95%"
                width="100%"
                defaultLanguage={language}
                value={value}
                theme={"vs-dark"}
                onChange={onChange}
                options={{
                    minimap: { enabled: true },
                    fontSize: 14,
                    lineNumbers: "on",
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    readOnly: false,
                    automaticLayout: true,
                }}
            />

        </div>
    )
}

export default CodeEditor