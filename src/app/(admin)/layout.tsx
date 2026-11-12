import './admin.css'

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-[#fafafa] text-zinc-900 antialiased">{children}</body>
    </html>
  )
}
