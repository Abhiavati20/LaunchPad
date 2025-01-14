import { Network } from 'lucide-react'
import React, { useEffect } from 'react'
import { ScrollArea } from '../ui/scroll-area';
import { FileTree } from './FileTree';
import { IFileStructure } from '@/app/builder/page';




const FileStructure = ({demoFiles, handleFileSelect}:{demoFiles:IFileStructure[], handleFileSelect:(fileName:string)=>void}) => {
    useEffect(() => {
        console.log("FILES", demoFiles);
    }, [demoFiles])
    return (
        <div className="w-1/3 cursor-pointer flex flex-col">
            <span className='w-full p-1 border border-gray-700 flex items-center gap-3 rounded-md'><Network className="-rotate-90" size={14} /> Files</span>
            <ScrollArea className="h-full p-2">
                <FileTree files={demoFiles}  handleFileSelect={handleFileSelect} />
            </ScrollArea>
        </div>
    )
}

export default FileStructure