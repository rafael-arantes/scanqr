import Link from 'next/link';

export default function ScanLimitReached() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-orange-50 to-red-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Limite de Scans Atingido</h1>
          <p className="text-slate-600">O proprietário deste QR Code atingiu o limite mensal de scans do plano atual.</p>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-slate-700">
            <strong>Para o proprietário:</strong> Faça upgrade do seu plano para continuar recebendo scans ou aguarde a
            renovação mensal.
          </p>
        </div>

        <Link
          href="/"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Criar Meu QR Code Grátis
        </Link>

        <p className="text-xs text-slate-500 mt-6">
          Este QR Code foi criado com{' '}
          <Link href="/" className="underline hover:text-slate-700">
            ScanQR
          </Link>
        </p>
      </div>
    </div>
  );
}
