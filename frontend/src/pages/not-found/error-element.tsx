import error from '@/assets/error.webp'
import { Link } from 'react-router'

export default function ErrorElement() {
    return (
        <div className='min-h-screen flex items-center text-sm px-8 md:text-base justify-center text-center flex-col'>
            <img src={error} alt="errr_image" className='size-[350px]' />
            <p className='font-bold mb-2'>Whoops!</p>
            <p className='max-w-md mx-auto mb-5 text-sm'>
                Server's taking a nap since my senior project wrapped up and I'm not paying for hosting anymore. But hey, the app is super cool! Clone it and run it locally to see what it can do. Trust me, it's worth it!
            </p>
            <Link to='/' className='transition duration-300 rounded-full font-medium hover:text-brand'>
                &larr; Go Back
            </Link>
        </div>
    )
}
