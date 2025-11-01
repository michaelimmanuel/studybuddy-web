import React from 'react'
import Button from '../Button'

const Hero = () => {
  return (
    <section className="flex h-[80vh] pt-16 p-48 bg-gradient-to-b from-[#002644] to-[#005FAA] text-white items-center justify-between font-sans">
      <div className="flex-1 flex-row items-center justify-center">
        <h1 className='text-6xl font-bold mb-12'>Menemani Belajar <br /> 
        <span className='text-transparent [-webkit-text-stroke:_2px_#fff]'>Kapan Pun Dimanapun</span>
        </h1>
        <h1 className="text-2xl">Raih mimpimu menjadi <span className='font-bold'>dokter gigi</span> dengan persiapan yang  <span className='font-bold'>lebih terarah dan penuh percaya diri. </span> Bersama <span className='font-bold'>StudyBuddy</span>, perjalanan preklinik menuju kelulusan UKMP2DG terasa lebih ringan dan menyenangkan.</h1>
        {/* <Button className="mt-6 px-8">Gabung Sekarang</Button> */}
      </div>
      <div className="flex-1 flex items-center justify-center">
        <img src="/img/hero-img.png" alt="Hero" className="max-w-full h-auto" />
      </div>
    </section>
  )
}

export default Hero