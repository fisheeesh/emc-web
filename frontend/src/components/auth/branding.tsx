import { APP_NAME } from '@/lib/constants';
import fullLogo from '../../assets/ata-logo.png';
import halfDark from '../../assets/half-dark.png';
import halfLight from '../../assets/half-light.png'
import { useTheme } from '../shared/theme-provider'

export default function Branding() {
    const { theme } = useTheme()

    return (
        <div className="flex flex-col items-center justify-center w-full space-y-1 lg:w-2/3 left-side">
            <img src={fullLogo} className="hidden md:block w-[300px]" alt="" />
            <div className="flex items-center space-x-3 md:hidden mb-7">
                <img src={theme == 'dark' ? halfLight : halfDark} className="md:hidden block w-[100px]" alt="" />
                <div className="w-[1px] mt-0.5 h-6 bg-gray-300"></div>
                <h1 className="font-mich tracking-wider text-xs sm:text-sm dark:bg-gradient-to-r dark:from-purple-400 dark:via-pink-500 dark:to-blue-500 dark:bg-clip-text dark:text-transparent">{APP_NAME}</h1>
            </div>
            <h1 className="hidden font-mich tracking-wider text-white dark:bg-gradient-to-r dark:from-purple-400 dark:via-pink-500 dark:to-blue-500 dark:bg-clip-text dark:text-transparent text-sm md:block">{APP_NAME}</h1>
        </div>
    )
}
