import React from 'react'

const Pricing = () => {
  return (
    <section className="py-12 px-4 md:px-48">
      <h2 className="text-3xl font-bold mb-6 text-center">Pricing</h2>
      <div className="flex flex-col gap-8 w-8/12 mx-auto">
        {/* XaviBuddies Card */}
        <div className="relative rounded-2xl bg-green bg-[url('/img/wave-bg.svg')] bg-cover p-8 flex flex-col md:flex-row items-center justify-between shadow-lg">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white rounded-lg p-2">
                <img src="/img/tooth-icon.png" alt="" className='w-8 h-8 bg-white'/>
              </div>
              <span className="text-white text-3xl font-bold">XaviBuddies</span>
            </div>
            <div className="flex gap-4 mb-4">
              <div className="bg-white/30 rounded-lg px-6 py-2 text-xl font-bold text-white">Rp199.000</div>
              <button className="bg-white text-green font-semibold rounded-lg px-6 py-2 hover:bg-gray-100 transition">Daftar Sekarang</button>
            </div>
            <div className="flex flex-wrap gap-6 mt-4">
              <div className="flex items-center gap-2 text-white">
                <span className="text-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-icon lucide-circle-check"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                </span>
                Waktu pengerjaan fleksibel
              </div>
              <div className="flex items-center gap-2 text-white">
                <span className="text-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-icon lucide-circle-check"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                </span>
                Bebas konsultasi selama masa aktif
              </div>
              <div className="flex items-center gap-2 text-white">
                <span className="text-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-icon lucide-circle-check"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                </span>
                Berlaku hingga jadwal UKMP2DG
              </div>
            </div>
          </div>
          <div className="flex-1 flex justify-end items-center absolute bottom-0 -right-2">
            <img src="/img/xavi-doctor.png" alt="Xavi Doctor" className="w-40 h-40 object-contain" />
          </div>
        </div>
        {/* OlineeBuddies Card */}
        <div className="relative rounded-2xl bg-white p-8 flex flex-col md:flex-row items-center justify-between shadow-lg">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-green/10 rounded-lg p-2">
                {/* Icon placeholder */}
                <img src="/img/tooth-icon.png" alt="" className='w-8 h-8'/>
              </div>
              <span className="text-green text-3xl font-bold">OlineeBuddies</span>
            </div>
            <div className="flex gap-4 mb-4">
              <div className="bg-green/10 rounded-lg px-6 py-2 text-xl font-bold text-green">Rp199.000</div>
              <button className="bg-green text-white font-semibold rounded-lg px-6 py-2 hover:bg-green-700 transition">Daftar Sekarang</button>
            </div>
            <div className="flex flex-wrap gap-6 mt-4">
              <div className="flex items-center gap-2 text-green">
                <span className="text-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-icon lucide-circle-check"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                </span>
                Waktu pengerjaan fleksibel
              </div>
              <div className="flex items-center gap-2 text-green">
                <span className="text-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-icon lucide-circle-check"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                </span>
                Bebas konsultasi selama masa aktif
              </div>
              <div className="flex items-center gap-2 text-green">
                <span className="text-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-icon lucide-circle-check"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                </span>
                Berlaku hingga jadwal UKMP2DG
              </div>
            </div>
          </div>
          <div className="flex-1 flex justify-end items-center absolute bottom-0 -right-2">
            <img src="/img/olinee-doctor.png" alt="Olinee Doctor" className="w-40 h-40 object-contain" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Pricing