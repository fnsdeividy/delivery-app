import { redirect } from 'next/navigation'

interface PageProps { params: { slug: string } }

export default function NovoProdutoPage({ params }: PageProps) {
  redirect(`/dashboard/${params.slug}/produtos?new=1`)
}

