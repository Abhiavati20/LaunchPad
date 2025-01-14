import { IFileStructure, IStep } from '@/app/builder/page'
import { processSteps } from '@/lib/utils'
import { Circle, CircleCheckBig, Copy } from 'lucide-react'
import React, { Dispatch, SetStateAction, useEffect } from 'react'
interface IStepsProps {
    steps: IStep[]
    files: IFileStructure[],
    setFiles: Dispatch<SetStateAction<IFileStructure[]>>
}
const Steps = ({ steps, setFiles }: IStepsProps) => {
    useEffect(() => {
        if (steps.length) {
            setFiles([...processSteps(steps)])
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[steps])
    return (
        <div className='flex flex-col p-5 h-full'>
            {steps.map((step, index) => 
                <div key={index} className="gap-2 bg-slate-200 p-2 w-full items-center rounded-md my-2 flex ">
                    {step.status!= "completed" ? <Circle size={12} className='text-gray-500' />:<CircleCheckBig size={12} className='text-green-500'/>}
                    <span className="text-sm flex flex-col gap-2 w-full">
                        {step.title}
                        {step.type === 4 && <span className="w-full p-2 flex justify-between items-center rounded-md text-white bg-slate-700 text-[12px] cursor-pointer">{step.code} <Copy size={12} className="cursor-pointer text-white"/></span>}
                    </span>
                    
                </div>
            )}
        </div>
    )
}

export default Steps