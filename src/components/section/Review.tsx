import React from 'react'
import { TestimonialCard } from '../ReviewCard'
import Button from '../Button'
import { VerticalMarquee } from '../VerticalMarquee'


const demoQuote =
  '"Awalnya aku kira belajar tentang gigi itu bakal ribet banget. Tapi setelah ikut kelas ini, ternyata gampang dipahami banget! Serius, penjelasannya step by step, jadi gak bikin pusing. Sekarang malah jadi makin semangat belajar."'

const CARDS = [
  { quote: demoQuote, name: "Khairunnisa", org: "Universitas Indonesia" },
  { quote: demoQuote, name: "Rafi", org: "Universitas Airlangga" },
  { quote: demoQuote, name: "Andien", org: "Universitas Gadjah Mada" },
  { quote: demoQuote, name: "Bima", org: "Universitas Padjadjaran" },
  { quote: demoQuote, name: "Alya", org: "Universitas Brawijaya" },
]

const Review = () => {
    function stack(cards: { quote: string; name: string; org: string }[], offset: number) {
        // Rotates the array by offset, so items start at different positions for each marquee
        const len = cards.length;
        const start = ((offset % len) + len) % len;
        return [...cards.slice(start), ...cards.slice(0, start)];
    }

  return (
    <section
      className="mx-auto max-w-[80vw] rounded-2xl p-6 md:p-8 lg:p-10"
      style={{ backgroundColor: "var(--brand)", color: "var(--brand-foreground)" }}
    >
      <div className="grid items-start gap-8 lg:grid-cols-3 ">
        {/* Left column - copy */}
        <div className="flex flex-col justify-center h-full space-y-4">
          <p className="text-sm opacity-90">Suara pengguna StudyBuddy</p>
          <h2 className="text-pretty text-3xl font-semibold leading-tight md:text-4xl">
            Belajar gigi tuh bisa seru juga, lho! Ini cerita temen-temen yang udah belajar langsung.
          </h2>
          <Button className='mt-4 text-base font-medium bg-white !text-green w-64'>
            Gabung Sekarang
          </Button>
        </div>

        {/* Middle column - comes from bottom (scroll up) */}
        <VerticalMarquee
          direction="up"
          duration={26}
          items={stack(CARDS, 0).map((c, i) => <TestimonialCard key={i} {...c} />)}
          className="mx-auto w-full"
          height={560}
        />

        {/* Right column - comes from top (scroll down) */}
        <VerticalMarquee
          direction="down"
          duration={26}
          items={stack(CARDS, 2).map((c, i) => <TestimonialCard key={i} {...c} />)}
          className="mx-auto w-full"
          height={560}
        />
      </div>

      {/* Optional: keep a hidden reference of the provided mockup for context */}
      <img
        src="/images/testimonials-reference.png"
        alt="Reference design for the testimonials marquee section"
        className="hidden"
        aria-hidden="true"
      />
    </section>
  )
}

export default Review