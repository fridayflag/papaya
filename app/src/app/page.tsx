import Link from "next/link";

export default async function IndexPage() {
  return (
    <div>
      <h1>Papaya</h1>
      <Link href="/journal">/journal</Link>
    </div>
  )
}
