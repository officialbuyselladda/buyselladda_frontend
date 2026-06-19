import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const run = async () => {
      const result = await verifyEmail(token);
      setStatus(result?.success ? 'success' : 'failed');
      if (result?.success) setTimeout(() => navigate('/', { replace: true }), 1200);
    };
    run();
  }, [navigate, token, verifyEmail]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-xl">
        {status === 'loading' && <Loader2 className="mx-auto h-12 w-12 animate-spin text-orange-600" />}
        {status === 'success' && <CheckCircle className="mx-auto h-12 w-12 text-emerald-600" />}
        {status === 'failed' && <XCircle className="mx-auto h-12 w-12 text-red-600" />}
        <h1 className="mt-5 text-2xl font-black text-gray-950">
          {status === 'loading' ? 'Verifying email' : status === 'success' ? 'Email verified' : 'Verification failed'}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {status === 'loading' ? 'Please wait while we confirm your account.' : status === 'success' ? 'You are logged in and can continue.' : 'The link may be expired. Please register again or contact support.'}
        </p>
        {status === 'failed' && <Link to="/login" className="mt-6 inline-flex rounded-xl bg-orange-600 px-5 py-3 font-bold text-white">Back to login</Link>}
      </div>
    </main>
  );
};

export default VerifyEmail;
