export default function PayzoneReturnPage({ searchParams }: { searchParams: { reference?: string } }) {
  return (
    <main className="mx-auto max-w-xl px-6 py-20 text-center">
      <h1 className="text-2xl font-semibold">Payment received for verification</h1>
      <p className="mt-3 text-muted-foreground">Your order will update after Payzone confirms the payment securely.</p>
      {searchParams.reference ? <p className="mt-4 text-sm">Reference: {searchParams.reference}</p> : null}
    </main>
  )
}
