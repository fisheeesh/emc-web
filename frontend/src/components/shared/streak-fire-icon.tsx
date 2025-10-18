import Lottie from 'lottie-react'
import fire from '@/assets/lottie/fire.json';

export default function StreakFireIcon({ value }: { value: number }) {
    return (
        <div className="relative inline-flex items-center justify-center w-[60px] h-[60px]">
            <Lottie
                autoplay
                loop
                animationData={fire}
                style={{
                    height: '60px',
                    width: '60px',
                    position: 'absolute',
                    top: 0,
                    left: 0
                }}
            />
            <div className="absolute top-9 flex items-center justify-center z-10 pb-1">
                <span className="font-bold text-white text-sm font-en drop-shadow-[0_2px_10px_rgba(0,0,0,1)] [text-shadow:_0_1px_4px_rgb(0_0_0_/_100%),_0_2px_8px_rgb(0_0_0_/_80%)]">
                    {value}
                </span>
            </div>
        </div>
    )
}
