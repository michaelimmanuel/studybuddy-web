"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Plus } from "lucide-react"

type FaqItem = {
  question: string
  answer: string
}

const defaultItems: FaqItem[] = [
  {
    question: "Kenapa memilih study buddy?",
    answer:
      "ENAMED.ID adalah platform try–out kedokteran gigi terbaik yang menyediakan soal berkualitas, menyesuaikan silabus UKMP2DG. Harga yang murah dengan kualitas nomor SATU!. Menyesuaikan dengan kantong mahasiswa ya gengs!",
  },
  { question: "Kenapa memilih study buddy?", answer: "Jawaban placeholder untuk item kedua." },
  { question: "Kenapa memilih study buddy?", answer: "Jawaban placeholder untuk item ketiga." },
  { question: "Kenapa memilih study buddy?", answer: "Jawaban placeholder untuk item keempat." },
]

export function FAQSection({ items = defaultItems }: { items?: FaqItem[] }) {
  return (
    <section aria-labelledby="faq-heading" className="mx-auto max-w-5xl rounded-2xl bg-muted p-6 md:p-10">
      <header className="text-center">
        <h2 id="faq-heading" className="text-balance text-3xl font-semibold text-green md:text-4xl">
          FAQ
        </h2>
        <p className="mx-auto mt-3 max-w-3xl text-pretty text-muted-foreground">
          Total 100+ Talenta Digital Skilvul, Simak keseruan dan manfaat yang dirasakan para Digitalent. Apakah kamu
          selanjutnya?
        </p>
      </header>

      <div className="mt-8 grid gap-4">
        <Accordion type="single" collapsible defaultValue="item-0">
          {items.map((it, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`} className="group border-none">
              <div className="rounded-xl bg-card p-5 ring-1 ring-border md:p-6">
                <AccordionTrigger className="w-full hover:no-underline [&>svg]:hidden">
                  <div className="flex w-full items-start justify-between gap-4">
                    <span className="text-pretty text-lg font-medium md:text-xl">{it.question}</span>
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-green text-brand-foreground transition-transform group-data-[state=open]:rotate-45">
                      <Plus className="size-5 text-white" aria-hidden="true" />
                      <span className="sr-only">Toggle</span>
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-3 text-muted-foreground md:text-base">{it.answer}</AccordionContent>
              </div>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

export default FAQSection
