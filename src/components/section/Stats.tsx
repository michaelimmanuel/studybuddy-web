import React from 'react'

const Stats = () => {
  return (
    <section className="flex flex-col md:flex-row items-center justify-between py-12 px-48">
      {/* Left: Text (1/3) */}
      <div className="w-full md:w-1/3 flex flex-col justify-center px-4 mb-8 md:mb-0">
        <h2 className="text-3xl font-bold mb-2">Ikut Belajar Bareng di StudyBuddy!</h2>
        
      </div>
      {/* Right: Stats (2/3) */}
      <div className="w-full md:w-2/3 grid grid-cols-1 md:grid-cols-3 gap-6 px-4 bg-green text-white rounded-lg">
        <div className=" rounded-lg  p-6 flex flex-col items-center">
          <span className="text-4xl font-bold text-customGreen">12,500+</span>
          <span className="mt-2 text-gray-100">Jumlah Pengguna</span>
        </div>
        <div className=" rounded-lg  p-6 flex flex-col items-center">
          <span className="text-4xl font-bold text-customGreen">320+</span>
          <span className="mt-2 text-gray-100">Tryout Terlaksana</span>
        </div>
        <div className=" rounded-lg  p-6 flex flex-col items-center">
          <span className="text-4xl font-bold text-customGreen">2,100+</span>
          <span className="mt-2 text-gray-100">Jumlah Alumni</span>
        </div>
      </div>
    </section>
  )
}

export default Stats