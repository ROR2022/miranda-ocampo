import React from 'react'
import DinamicGallery from '@/components/sections/DinamicGallery/DinamicGallery'
import Link from 'next/link'

const page = () => {
  return (
    <div>
      <DinamicGallery />
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