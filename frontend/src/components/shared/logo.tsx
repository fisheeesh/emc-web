
import halfDark from '@/assets/half-dark.png';
import halfLight from '@/assets/half-light.png'
import { useTheme } from './theme-provider';
import { APP_NAME } from '@/lib/constants';

export default function Logo() {
    const { theme } = useTheme()

    return (
        <div className="flex items-center space-x-3 mb-7">
            <img src={theme == 'dark' ? halfLight : halfDark} className="w-[100px]" alt="" />
            <div className="w-[1px] mt-0.5 h-6 bg-gray-300"></div>
            <h1 className="font-mich tracking-wider text-xs sm:text-sm dark:bg-gradient-to-r dark:from-purple-400 dark:via-pink-500 dark:to-blue-500 dark:bg-clip-text dark:text-transparent">{APP_NAME}</h1>
        </div>
    )
}
