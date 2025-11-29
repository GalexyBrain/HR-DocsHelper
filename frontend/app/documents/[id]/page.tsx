export default function DocumentPage({ params }: { params: { id: string } }) {
  return <h1>Document Page: {params.id}</h1>;
}
