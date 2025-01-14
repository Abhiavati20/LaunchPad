import { useEffect } from 'react'
import {WebContainer} from "@webcontainer/api"
import { useMyContext } from '@/Providers';
const useWebcontainer = () => {
    const { webcontainer, setWebcontainer} = useMyContext();
    async function main() {
        if (!webcontainer) {
            const webcontainerInstance = await WebContainer.boot();
            setWebcontainer(webcontainerInstance);
        }
    }
    useEffect(() => {
        if (!webcontainer) {
            main()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return webcontainer
}

export default useWebcontainer