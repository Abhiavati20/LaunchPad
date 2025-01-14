"use client";
import React, { useState } from 'react'
import { ChevronDown, ChevronRight, File } from 'lucide-react';
import { IFileStructure } from '@/app/builder/page';

export const FileTree = ({files, level = 0, handleFileSelect}:{files:IFileStructure[], level?:number, handleFileSelect:(fileName:string) =>void}) => {
    
    const [folderOpen, setFolderOpen] = useState<Record<string,boolean>>({})
    function handleIcon(isExpanded:boolean) {
        return isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
    }

    const toggleFolder = (folderName: string) => {
        setFolderOpen(prev => ({
        ...prev,
        [folderName]: !prev[folderName]
        }));
    };
    
    function handleClick(item: IFileStructure) {
        if (item.type === "folder") {
            toggleFolder(item.name)
        }
        else handleFileSelect(item.name);
    }
    
    return (
        <div style={{ paddingLeft: level * 12 }}>
            {files.map((item, index) => {
                const isFolder = item.type === "folder";
                const isExpanded = folderOpen[item.name];
                const hasChildren = isFolder && item.children && item.children.length > 0;
                return (
                    <div key={index}>
                        <div onClick={() => handleClick(item)} className='w-full gap-2 px-2 py-1 rounded-md flex items-center cursor-pointer hover:bg-gray-700'>
                            {isFolder ? handleIcon(isExpanded) : <File size={14} />}
                            {item.name}
                        </div>
                        {isExpanded && hasChildren && <FileTree handleFileSelect={handleFileSelect} files={item.children!} level={level + 1} />}
                    </div>
                )
            })}
        </div>
    )
}
