import { IFileStructure, IStep, StepType } from "@/app/builder/page";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
// import { parseStringPromise } from "xml2js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// function fixXml(inputXml: string): string {
//   // Ensure attribute values are quoted
//   let sanitizedXml = inputXml.replace(/(\w+)=(?!['"])(\S+)/g, '$1="$2"');

//   // Escape characters that might cause invalid tag name issues
//   sanitizedXml = sanitizedXml.replace(/[<>&]/g, (match) => {
//     switch (match) {
//       case '<':
//         return '&lt;';
//       case '>':
//         return '&gt;';
//       case '&':
//         return '&amp;';
//       default:
//         return match;
//     }
//   });

//   return sanitizedXml;
// }

export function parseXmlToSteps(response: string): IStep[] {
  // Extract the XML content between <launchpadArtifact> tags
  const xmlMatch = response.match(/<launchpadArtifact[^>]*>([\s\S]*?)<\/launchpadArtifact>/);
    
  if (!xmlMatch) {
    return [];
  }
  
  const xmlContent = xmlMatch[1];
  const steps: IStep[] = [];
  let stepId = 1;
  
  // Extract artifact title
  const titleMatch = response.match(/title="([^"]*)"/);
  const artifactTitle = titleMatch ? titleMatch[1] : 'Project Files';
  
  // Add initial artifact step
  steps.push({
    id: stepId++,
    title: artifactTitle,
    description: '',
    type: StepType.CreateFolder,
    status: 'pending'
  });
  
  // Regular expression to find launchpadAction elements
  const actionRegex = /<launchpadAction\s+type="([^"]*)"(?:\s+filePath="([^"]*)")?>([\s\S]*?)<\/launchpadAction>/g;
    
  let match;
  while ((match = actionRegex.exec(xmlContent)) !== null) {
    const [, type, filePath, content] = match;
  
    if (type === 'file') {
      // File creation step
      steps.push({
        id: stepId++,
        title: `Create ${filePath || 'file'}`,
        description: '',
        type: StepType.CreateFile,
        status: 'pending',
        code: content.trim(),
        path: filePath
      });
    } else if (type === 'shell') {
      // Shell command step
      steps.push({
        id: stepId++,
        title: 'Run command',
        description: '',
        type: StepType.RunScript,
        status: 'pending',
        code: content.trim()
      });
    }
  }
  
  return steps;
}


export function processSteps(steps: IStep[]): IFileStructure[] {
    const fileStructure: IFileStructure[] = [];

    const findOrCreateFolder = (path: string, structure: IFileStructure[]): IFileStructure => {
        const parts = path.split("/");
        let current: IFileStructure | undefined;

        parts.forEach((part) => {
            current = structure.find(item => item.name === part && item.type === "folder");
            if (!current) {
                current = {
                    name: part,
                    type: "folder",
                    children: [],
                };
                structure.push(current);
            }
            structure = current.children!;
        });

        return current!;
    };

    const createFileStructure = (step: IStep, structure: IFileStructure[]): boolean => {
        if (!step.path) return false;

        const pathParts = step.path.split("/");
        const fileName = pathParts.pop()!;
        const folderPath = pathParts.join("/");

        const parentFolder = folderPath ? findOrCreateFolder(folderPath, structure) : null;

        const targetArray = parentFolder ? parentFolder.children! : structure;

        if (step.type === StepType.CreateFile) {
            const existingFile = targetArray.find(item => item.name === fileName && item.type === "file");
            if (!existingFile) {
                targetArray.push({
                    name: fileName,
                    type: "file",
                    content: step.code || "",
                    path: step.path,
                    language: step.path.split('.').pop() // Inferring language by extension if applicable.
                });
                return true;
            }
        } else if (step.type === StepType.CreateFolder) {
            const existingFolder = targetArray.find(item => item.name === fileName && item.type === "folder");
            if (!existingFolder) {
                targetArray.push({
                    name: fileName,
                    type: "folder",
                    children: [],
                    path: step.path
                });
                return true;
            }
        }

        return false;
    };

    steps.forEach(step => {
        let success = false;
        switch (step.type) {
            case StepType.CreateFile:
            case StepType.CreateFolder:
                success = createFileStructure(step, fileStructure);
                break;
            default:
                break;
        }

        if (success) {
            step.status = "completed";
        }
    });

    return fileStructure;
}