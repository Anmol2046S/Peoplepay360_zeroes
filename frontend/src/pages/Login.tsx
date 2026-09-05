const Login = () => {
  return (
    <div className="flex h-screen bg-white">
      <div className="w-1/2 bg-primary flex flex-col justify-center items-center text-white p-12">
        <div className="max-w-md w-full">
          <h1 className="text-4xl font-bold mb-4">PEOPLEPAY360</h1>
          <p className="text-xl text-primary-light">People operations, payroll and workforce management — unified.</p>
        </div>
      </div>
      <div className="w-1/2 flex items-center justify-center p-12">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-charcoal">Sign in to your account</h2>
          </div>
          <form className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-charcoal">Email address</label>
                <input type="email" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
              </div>
              <div>
                <label className="text-sm font-medium text-charcoal">Password</label>
                <input type="password" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
              </div>
            </div>
            <button type="button" className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary-hover transition-colors">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
