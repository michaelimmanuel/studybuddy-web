import React from 'react'
import Button from '../Button'

const Hero = () => {
  return (
    <section className="flex h-[80vh] p-48">
      <div className="flex-1 flex-row items-center justify-center">
        <h1 className="text-6xl font-bold">Kini Hadir Di <br/> Seluruh Indonesia</h1>
        <p className="text-justify w-lg mt-6">Lindungi data diri, jangan sampai rugi sendiri. Yuk, cari tau panduan komprehensif keamanan digital perbankan disini!</p>
        <Button className="mt-6 px-8">Gabung Sekarang</Button>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <img src="/img/hero-img.png" alt="Hero" className="max-w-full h-auto" />
      </div>
    </section>
  )
}

export default Hero