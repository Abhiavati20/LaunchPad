"use client";

import { WebContainer } from "@webcontainer/api";
import React, { createContext, useState } from "react";

import { useContext } from "react";

interface ContextType {
    prompts: string[];
    setPrompts: React.Dispatch<React.SetStateAction<string[]>>;
    userPrompt: string;
    setUserPrompt: React.Dispatch<React.SetStateAction<string>>;
    webcontainer: WebContainer | undefined;
    setWebcontainer: React.Dispatch<React.SetStateAction<WebContainer | undefined>>;
}
export const contextProvider = createContext<ContextType | undefined>(undefined);

const ContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [prompts, setPrompts] = useState<string[]>([]);
    const [userPrompt, setUserPrompt] = useState<string>("");
    const [webcontainer,setWebcontainer] = useState<WebContainer>()
    return (
        <contextProvider.Provider value={{ prompts, setPrompts, userPrompt, setUserPrompt, webcontainer, setWebcontainer}}>{children}</contextProvider.Provider>
    )
}

export default ContextProvider


export const useMyContext = () => {
    const context = useContext(contextProvider);
    if (!context) {
        throw new Error("useMyContext must be used within a ContextProvider");
    }
    return context;
};