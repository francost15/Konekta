import { UserProfile } from '@clerk/nextjs'
import Link from 'next/link'

const UserProfilePage = () => (
  <div className="flex justify-center items-center min-h-screen bg-white">
    <div className="absolute left-4 top-14">
      <Link href="/home">
        <button className='text-emerald-600 text-xs hover:text-emerald-800 hover:bg-neutral-50 px-2 py-1 rounded-md'>Volver al Perfil</button>
      </Link>
    </div>
    <div className="w-full max-w-4xl">
      <UserProfile routing="hash" />
    </div>
  </div>
)

export default UserProfilePage 