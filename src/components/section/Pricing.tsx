import React from 'react'

const Pricing = () => {
  return (
    <section id="pricing" className="py-12 px-4 md:px-48 bg-gradient-to-b from-[#002644] to-[#005FAA]">
      <h2 className="text-3xl font-bold mb-6 text-center text-white">Pricing</h2>
      <div className="flex flex-col gap-8 w-8/12 mx-auto">

        {/* XaviBuddies Card */}
        <div className="relative rounded-2xl backdrop-blur-md border border-white/20 shadow-xl p-1" style={{background: 'radial-gradient(circle, rgba(0, 95, 170, 0.4) 0%, rgba(0, 95, 170, 0.2) 100%)'}}>
          <div className="rounded-xl backdrop-blur-sm p-8 flex flex-col md:flex-row items-center justify-between" style={{background: 'radial-gradient(circle, rgba(0, 38, 68, 0.5) 0%, rgba(0, 38, 68, 0.3) 100%)'}}>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white rounded-lg p-2">
                  <img src="/img/tooth-icon.png" alt="" className='w-8 h-8 bg-white'/>
                </div>
                <span className="text-white text-3xl font-bold">XaviBuddies</span>
              </div>
              <div className="flex gap-4 mb-4">
                <div className="bg-white/30 rounded-lg px-6 py-2 text-xl font-bold text-white">Rp160.000</div>
                <button className="bg-white text-[#002644] font-semibold rounded-lg px-6 py-2 hover:bg-gray-100 transition">Mulai Belajar</button>
              </div>
              <div className="flex flex-wrap gap-6 mt-4">
                <div className="flex items-center gap-2 text-white">
                  <span className="text-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-icon lucide-circle-check"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                  </span>
                  Bundling Try-out dan  Mini games
                </div>
                <div className="flex items-center gap-2 text-white">
                  <span className="text-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-icon lucide-circle-check"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                  </span>
                  Bisa diakses kapanpun dimanapun
                </div>
                <div className="flex items-center gap-2 text-white">
                  <span className="text-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-icon lucide-circle-check"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                  </span>
                  Bebas konsultasi dan diskusi 
                </div>
              </div>
            </div>
            <div className="flex-1 flex justify-end items-center absolute bottom-0 -right-2">
              <img src="/img/xavi-doctor.png" alt="Xavi Doctor" className="w-40 h-40 object-contain" />
            </div>
          </div>
        </div>

        {/* OlineeBuddies Card */}
        <div className="relative rounded-2xl backdrop-blur-md border border-white/20 shadow-xl p-1" style={{background: 'radial-gradient(circle, rgba(0, 95, 170, 0.4) 0%, rgba(0, 95, 170, 0.2) 100%)'}}>
          <div className="rounded-xl backdrop-blur-sm p-8 flex flex-col md:flex-row items-center justify-between" style={{background: 'radial-gradient(circle, rgba(0, 38, 68, 0.5) 0%, rgba(0, 38, 68, 0.3) 100%)'}}>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/20 rounded-lg p-2">
                  {/* Icon placeholder */}
                  <img src="/img/tooth-icon.png" alt="" className='w-8 h-8'/>
                </div>
                <span className="text-white text-3xl font-bold">OlineeBuddies</span>
              </div>
              <div className="flex gap-4 mb-4">
                <div className="bg-white/30 rounded-lg px-6 py-2 text-xl font-bold text-white">Rp160.000</div>
                <button className="bg-white text-[#002644] font-semibold rounded-lg px-6 py-2 hover:bg-gray-100 transition">Mulai Belajar</button>
              </div>
              <div className="flex flex-wrap gap-6 mt-4">
                <div className="flex items-center gap-2 text-white">
                  <span className="text-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-icon lucide-circle-check"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                  </span>
                  Mini-game only
                </div>
                <div className="flex items-center gap-2 text-white">
                  <span className="text-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-icon lucide-circle-check"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                  </span>
                  Bisa diakses kapanpun dimanapun
                </div>
                <div className="flex items-center gap-2 text-white">
                  <span className="text-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-icon lucide-circle-check"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                  </span>
                  Bebas konsultasi dan diskusi 
                </div>
              </div>
            </div>
            <div className="flex-1 flex justify-end items-center absolute bottom-0 -right-2">
              <img src="/img/olinee-doctor.png" alt="Olinee Doctor" className="w-40 h-40 object-contain" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Pricing