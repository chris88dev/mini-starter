const features = [
  {
    title: "Start lokaal",
    body: 'Zeg "start" en de dev-server draait met live preview op localhost.',
  },
  {
    title: "Publiceer direct",
    body: 'Zeg "publiceer" — commit op main en deploy via de Vercel CLI naar productie.',
  },
  {
    title: "Vangnet ingebouwd",
    body: 'Ging er iets mis? Zeg "fix" en je komt terug op een werkende versie, met backup.',
  },
]

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center px-6 py-20">
      <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm text-muted">
        <span className="size-2 rounded-full bg-accent" />
        Next.js 16 · Tailwind v4 · Vercel
      </span>

      <h1 className="text-balance text-5xl font-semibold tracking-tight sm:text-6xl">
        Mini Starter
      </h1>

      <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
        Een minimale boilerplate met ingebouwde skills om te starten, previewen,
        publiceren en herstellen — recht op <code className="text-foreground">main</code>,
        deploy via de Vercel CLI.
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        <a
          href="https://nextjs.org/docs"
          className="rounded-lg bg-accent px-5 py-2.5 font-medium text-accent-foreground transition-opacity hover:opacity-90"
        >
          Next.js docs
        </a>
        <a
          href="https://vercel.com/docs/cli"
          className="rounded-lg border border-border px-5 py-2.5 font-medium transition-colors hover:bg-card"
        >
          Vercel CLI
        </a>
      </div>

      <div className="mt-16 grid gap-4 sm:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-xl border border-border bg-card p-5"
          >
            <h2 className="font-medium">{f.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
          </div>
        ))}
      </div>

      <footer className="mt-20 border-t border-border pt-6 text-sm text-muted">
        Bewerk{" "}
        <code className="text-foreground">app/page.tsx</code> en sla op — de
        pagina ververst vanzelf.
      </footer>
    </main>
  )
}
