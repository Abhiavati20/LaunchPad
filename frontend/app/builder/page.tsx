"use client";

import CodeEditor from "@/components/CodeEditor/CodeEditor";
import FileStructure from "@/components/FileStructure/FileStructure";
import PromptInput from "@/components/PromptInput/PromptInput";
import Steps from "@/components/Steps/Steps";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "@/hooks/use-toast";
// import useWebcontainer from "@/hooks/useWebcontainer";
import { parseXmlToSteps } from "@/lib/utils";
import { useMyContext } from "@/Providers";
import axios from "axios";
import { useEffect, useState } from "react";
// import { useContext } from "react";
export interface IFileStructure {
    name: string;
    type: "file" | "folder";
    content?: string
    children?: IFileStructure[]
    folderOpen?: boolean
    language?: string
    path?:string
}

// const demoFiles: IFileStructure[] = [
//     {
//         name: "src",
//         type: "folder",
//         children: [
//             { name: "App.tsx", type: "file", content: 'export default function App() {\n  return <div>Hello World</div>;\n}', language:"typescript"},
//             { name: "index.tsx", type: "file", content: 'export default function App() {\n  return <div>Hello World index</div>;\n}', language:"typescript" },
//             { name: "components", type: "folder", children: [
//                     { name: "Button.tsx", type: "file", content:'export default function App() {\n  return <div>Hello World</div>;\n}', language:"typescript" },
//                     { name: "Card.tsx", type: "file", content:'export default function App() {\n  return <div>Hello World</div>;\n}', language:"typescript" },
//                 ]
//             }
//         ]
//     },
//     {
//         name: "public",
//         type: "folder",
//         children: [
//             { name: "favicon.ico", type: "file" },
//             { name: "logo.svg", type: "file" },
//         ],
//     },
//     { name: "package.json", type: "file", content: '{\n  "name": "demo-project",\n  "version": "1.0.0"\n}', language:"json" },
//     { name: "tsconfig.json", type: "file", content: '{\n  "name": "demo-project tsconfig",\n  "version": "1.0.0"\n}', language:"json" },
// ]

export enum StepType {
    CreateFile,
    CreateFolder,
    EditFile,
    DeletFile,
    RunScript,
    Link
}
export interface IStep {
    id: number;
    title: string;
    description: string
    type: StepType;
    status: "pending" | "in-progress" | "completed";
    code?: string;
    path?:string
}

export default function Home() {
    const { prompts, userPrompt,setPrompts, setUserPrompt } = useMyContext();
    const [steps, setSteps] = useState<IStep[]>([]);
    const [openTabs, setOpenTabs] = useState<Array<{id:string, title:string}>>([])
    const [activeTab, setActiveTab] = useState<string>("package.json");
    // const webcontainer = useWebcontainer();
    const [fileContents, setFileContents] = useState<string>("")
    const [files, setFiles] = useState<IFileStructure[]>([]);

    function findFile(files: IFileStructure[], fileName: string): IFileStructure | undefined {
        if (files.length > 0) {
            for (const file of files) {
                if (file.name === fileName) {
                    return file; // Found the file
                }
                if (file.type === "folder" && file.children) {
                    const found = findFile(file.children, fileName); // Search inside the folder
                    if (found) return found;
                }
            }
        }
        return undefined; // File not found
    }
    const handleFileSelect = (fileName: string) => {
        if (!openTabs.find((tab) => tab.id === fileName)) {
            setOpenTabs([...openTabs, { id: fileName, title: fileName }]);
        }
        setActiveTab(fileName);
        const fileContent = findFile(files, fileName)?.content;
        
        setFileContents(fileContent ?? "")
        
    };

    const handleTabClose = (tabName: string) => {
        setOpenTabs(openTabs.filter((tab) => tab.title !== tabName));
        if (activeTab === tabName) {
            // console.log("ACTIVE TAB", activeTab, openTabs[0]?.title)
            setActiveTab(openTabs[0]?.title || "");
        }
        handleFileSelect(tabName);
    };

    async function handleGenerate() {
        if (userPrompt === "") {
            toast({
                description: "Please enter a prompt",
                duration:2000,
            })
            return;
        }
        if (userPrompt.trim()) {
            try {
                const {data} = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/template`, {
                    prompt: userPrompt
                });
                setPrompts(data.prompts);
            } catch (error) {
                toast({
                    description: "There is some issue" + error,
                    variant:"destructive"
                })
            }
        }
    }

    const handleCodeChange = (value: string | undefined) => {
        if (value && activeTab) {
            setFileContents(value);
        }
    };

    async function mountFilestoWebcontainer() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transform = (files: IFileStructure[]): Record<string, any> => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result: Record<string, any> = {};

            for (const file of files) {
                if (file.type === 'file') {
                    result[file.name] = {
                        file: {
                            contents: file.content || ''
                        }
                    };
                } else if (file.type === 'folder') {
                    result[file.name] = {
                        directory: {
                            files: transform(file.children || [])
                        }
                    };
                }
            }

            return result;
        };
        const mountableStructure = transform(files);
        // await webcontainer?.mount(mountableStructure);
        console.log(mountableStructure)
        
    }
    useEffect(() => {
        
        mountFilestoWebcontainer();
        
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [files])
    async function init() {
        const { data } = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/template`, {
            prompt: userPrompt.trim()
        });
        setPrompts(data.prompts);
        const stepsResponse = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chat`, {
            messages: [...prompts, userPrompt].map(content => ({
                role: "user",
                content
            }))
        });
        console.log("STEP RESPONSE", stepsResponse.data?.code);
        const parsedsteps: IStep[] = await parseXmlToSteps(stepsResponse.data?.code);
        setSteps([...parsedsteps]);
    }
    useEffect(() => {
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    

    return (
        <div className="flex w-screen gap-1 items-center p-2 h-full overflow-x-hidden">
            <ScrollArea className="w-full md:w-1/4 h-full flex-col gap-2 overflow-auto">
                <Steps steps={steps} files={files} setFiles={setFiles} />
                <PromptInput className="w-full flex flex-col my-2 items-center gap-2 mx-auto" setUserPrompt={setUserPrompt} handleGenerate={handleGenerate} />
            </ScrollArea>
            <div className="w-full h-full md:w-3/4 flex flex-col">
                <ToggleGroup defaultValue="code" className="w-full justify-start items-center" type="single" size="default" >
                    <ToggleGroupItem value="code">
                        Code
                    </ToggleGroupItem>
                    <ToggleGroupItem value="preview">
                        Preview
                    </ToggleGroupItem>
                </ToggleGroup>
                    
                <div className="bg-black gap-2 text-white border border-gray-700 rounded-md p-2 w-full md:3/4 flex h-[95vh]">
                    <FileStructure demoFiles={files} handleFileSelect={handleFileSelect} />
                    <CodeEditor
                        tabs={openTabs}
                        activeTab={activeTab}
                        onTabChange={handleFileSelect}
                        onTabClose={handleTabClose}
                        value={fileContents}
                        language={ 
                            (activeTab.endsWith(".tsx") ? "typescript" : "plaintext")
                        }
                        onChange={handleCodeChange} />
                </div>
            </div>
        </div> 
    )
}