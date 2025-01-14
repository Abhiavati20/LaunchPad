import React, { ChangeEvent } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
interface IPromptInput {
    className:string
    setUserPrompt: React.Dispatch<React.SetStateAction<string>>;
    handleGenerate: () => void;
}
const PromptInput = (props:IPromptInput) => {
    const {setUserPrompt, handleGenerate, className}=props
    return (
        <div className={className}>
            <Input
                type="text"
                placeholder="How can Launch Pad help you?"
                onChange={(event: ChangeEvent<HTMLInputElement>) => setUserPrompt(event.target.value)}
                className="w-full my-1"
            />
            <Button onClick={handleGenerate} className="my-1">Generate</Button>
        </div>
    )
}

export default PromptInput