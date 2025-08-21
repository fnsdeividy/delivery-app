import { redirect } from 'next/navigation'

interface PageProps {
  params: { slug: string }
}

export default function ShortSlugRedirect({ params }: PageProps) {
  redirect(`/store/`)
}

