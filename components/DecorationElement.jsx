import React from 'react'
import Image from 'next/image'

const DecorationElement = () => {
    const imageUrl= '/images/decoration1.png'
  return (
    <div
      style={{
        zIndex: 5000,
      }}
      className="fixed inset-0 w-screen h-screen overflow-hidden"
    >
      <Image
        src={imageUrl}
        alt="Decoración de boda"
        fill
        className="object-contain"
        priority
        sizes="100vw"
      />
    </div>
  )
}

export default DecorationElement