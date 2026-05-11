import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { verifyEmailApi } from '../services/auth.api'

export default function VerifyEmail() {
  const { token } = useParams()
  const [status, setStatus] = useState('verifying') // verifying, success, error
  const [message, setMessage] = useState('')
  const hasCalled = useRef(false) // Thêm ref để chặn gọi 2 lần

  useEffect(() => {
    if (hasCalled.current) return;
    hasCalled.current = true;

    const verify = async () => {
      try {
        await verifyEmailApi(token)
        setStatus('success')
        setMessage('Your email has been verified successfully!')
      } catch (err) {
        setStatus('error')
        setMessage(err?.response?.data?.message || 'Verification failed. The link may be invalid or expired.')
      }
    }
    verify()
  }, [token])

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
      {status === 'verifying' && (
        <>
          <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800">Verifying Email...</h2>
          <p className="text-gray-600 mt-2">Please wait while we verify your account.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Verified!</h2>
          <p className="text-gray-600 mt-2">{message}</p>
          <Link to="/login" className="inline-block mt-6 bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2 px-6 rounded-lg transition">
            Login Now
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Verification Failed</h2>
          <p className="text-gray-600 mt-2">{message}</p>
          <Link to="/signup" className="inline-block mt-6 text-violet-600 font-semibold hover:underline">
            Try Signing Up Again
          </Link>
        </>
      )}
    </div>
  )
}
