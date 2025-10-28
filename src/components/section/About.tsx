import React from 'react'

const About = () => {
  return (
    <section className="flex flex-col md:flex-row items-center justify-between py-12 px-48 bg-gradient-to-b from-[#005FAA] to-[#002644] text-white">
      {/* Left: Image */}
      <div className="w-full md:w-1/2 flex justify-center mb-8 md:mb-0">
        <img
          src="/img/about-img.png"
          alt="About StudyBuddy"
          className="rounded-lg object-cover"
          width={600}
          height={600}
        />
      </div>
      {/* Right: Text */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-4">
        <h2 className="text-2xl font-bold mb-6  w-fit px-6 py-2 text-green">About Us</h2>
        <p className="text-lg text-white text-justify">
          Kami tahu, perjalanan menuju gelar dokter gigi bukanlah hal yang mudah
          penuh tantangan, kebingungan, dan rasa lelah.
          Di sinilah StudyBuddy hadir sebagai teman belajar yang siap membimbing Anda menghadapi perkuliahan, klinik hingga ujian UKMP2DG dengan cara yang lebih ringan, terarah, dan menyenangkan.
          Namun perjalanan kita tidak berhenti sampai di situ. StudyBuddy tumbuh sebagai komunitas hangat bagi calon dokter dan dokter gigi di seluruh Indonesia—sebuah ruang untuk saling belajar, berbagi pengalaman, berkonsultasi, dan menemukan dukungan. Bukan hanya seputar dunia kedokteran gigi, tetapi juga tentang tantangan nyata yang kita hadapi bersama di kehidupan sehari-hari.        </p>
        <br />
      </div>
    </section>
  );
}

export default About