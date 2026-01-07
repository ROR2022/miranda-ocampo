import React from 'react'
import GuestsManagement from '@/components/sections/GuestsManagement/GuestsManagement'
import Link from 'next/link'

const page = () => {
  return (
    <div>
      <GuestsManagement />
      <Link href="https://www.invitacionesweb.lat">
        <div className="p-3 bg-blue-600 text-white rounded-lg flex flex-col justify-center items-center">
          <p>Tienes un evento?</p>
          <p className="text-lg font-bold">Invitaciones Web</p>
          <p>es tu mejor opción</p>
        </div>
      </Link>
    </div>
  )
}

export default page