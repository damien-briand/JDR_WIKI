type PlaceholderPageProps = {
  title: string
  description?: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="page">
      <h1 className="page-title">{title}</h1>
      <p className="page-muted">{description ?? "Cette section arrive dans une prochaine étape."}</p>
    </div>
  )
}
