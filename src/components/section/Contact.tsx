import React from 'react'

const Contact = () => {
  return (
    <section id="contact" className="flex flex-col md:flex-row items-center justify-between py-12 px-48">
      {/* Left: Image (2/3) */}
      <div className="w-full md:w-2/3 flex justify-center mb-8 md:mb-0">
        <img
          src="/img/contact-us.png"
          alt="Contact Us"
          className="rounded-lg object-cover max-h-[600px]"
        />
      </div>
      {/* Right: Contact Info/Form (1/3) */}
      <div className="w-full md:w-1/3 flex flex-col px-4 py-8">
       <div className="bg-[#002644] rounded-xl p-6 md:p-10 text-white w-full max-w-md mx-auto ">
            <h2 className="text-2xl font-bold mb-4">Hubungi Kami</h2>
            <p className="text-lg text-white mb-4">Kami menjawab pertanyaan anda</p>
            <div className="space-y-2">
                <div className='border-white border-1 rounded-lg px-4 py-2 flex items-center justify-center'>
                        <img src='/img/instagram.png' alt='Instagram' className='w-6 h-6 inline-block mr-2'/>
                        <span className="text-lg">@studybuddymeds</span>
                </div>
                <div className='border-white border-1 rounded-lg px-4 py-2 flex items-center justify-center'>
                        <img src='/img/whatsapp.png' alt='WhatsApp' className='w-6 h-6 inline-block mr-2'/>
                        <span className="text-lg">@studybuddymeds</span>
                </div>
                <div className='border-white border-1 rounded-lg px-4 py-2 flex items-center justify-center'>
                        <img src='/img/telegram.png' alt='Telegram' className='w-6 h-6 inline-block mr-2'/>
                        <span className="text-lg">@_studybuddyy</span>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
}

export default Contact