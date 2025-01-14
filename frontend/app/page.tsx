"use client";
import PromptInput from "@/components/PromptInput/PromptInput";
import { useToast } from "@/hooks/use-toast";
import { useMyContext } from "@/Providers";
import axios from "axios";
import { useRouter } from "next/navigation";
export default function Home() {
    const {userPrompt, setUserPrompt} = useMyContext()
    const {setPrompts} = useMyContext();
    const { toast } = useToast();
    const router = useRouter()
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
                router.push("/builder")
            } catch (error) {
                console.log(error);
                toast({
                    description: "There is some issue",
                    variant:"destructive"
                })
            }
        }
    }
    return (
        <div className="flex flex-col w-full h-full items-center justify-center">
            <h1 className="text-5xl font-semibold my-2 flex items-center">Launch Pad <span className="text-3xl">🚀</span></h1>
            <h3 className="text-sm italic text-center my-2">Every idea needs a Launch Pad. <br/> Simply Just Prompt, Generate, Launch your mvps in one go!! 🚀</h3>
            <PromptInput className="w-3/4 md:w-1/3  flex flex-col my-4 items-center gap-2 mx-auto" setUserPrompt={setUserPrompt} handleGenerate={handleGenerate} />
        </div>
    )
}
