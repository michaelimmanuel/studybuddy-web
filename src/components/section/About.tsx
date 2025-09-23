import React from 'react'

const About = () => {
  return (
    <section className="flex flex-col md:flex-row items-center justify-between py-12 px-48">
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
        <h2 className="text-2xl font-bold mb-6 bg-[#06B2841A] w-fit px-6 py-2 text-green">Tentang Kami</h2>
        <p className="text-lg text-gray-700 text-justify">
         Enamed Indonesia adalah bimbingan belajar kedokteran gigi terbaik di Indonesia. Enamed Indonesia memilki pengajar yang berkualitas dan berasal dari universitas terbaik di Indonesia. Pengajar-pengajar kami sudah berpengalaman dan terlibat dari kegiatan-kegiatan seperti kompetisi, presentasi ilmiah, mantan asisten dosen, dan mentoring UKMP2DG
        </p>
        <br />
        <p className="text-lg text-gray-700 text-justify">
            Visi kami adalah meningkatkan nilai kompetensi dari dokter gigi pada tahapan preklinik, klinik, maupun UKMP2DG dengan modul dan layanan bimbingan yang paling sesuai standar kualitas kedokteran gigi.. Yuk kepoin Enamed Indonesia!
        </p>
      </div>
    </section>
  );
}

export default About