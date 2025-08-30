import fullLogo from '../../assets/full-ata-logo.png';
import haflLogo from '../../assets/half-ata-logo.png';
import lightLogo from '../../assets/light_logo.png'
import { useTheme } from '../shared/theme-provider'

export default function Branding() {
    const { theme } = useTheme()

    return (
        <div className="flex flex-col items-center justify-center w-full space-y-1 md:w-2/3 left-side">
            <img src={fullLogo} className="hidden md:block w-[300px]" alt="" />
            <div className="flex items-center space-x-3 md:hidden mb-7">
                <img src={theme == 'dark' ? lightLogo : haflLogo} className="md:hidden block w-[100px]" alt="" />
                <div className="w-[1px] mt-0.5 h-6 bg-gray-300"></div>
                <h1 className="font-normal tracking-wider text-md md:text-xl">Emotion Check-in System</h1>
            </div>
            <h1 className="hidden font-normal tracking-wider text-white text-md md:block">Emotion Check-in System</h1>
        </div>
    )
}
