import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, User, Activity, AlertTriangle, Info, CheckCircle, BrainCircuit, FileText, Layers } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agency, setAgency] = useState('');
  const [role, setRole] = useState('Officer');
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    agency: '',
    general: ''
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: '', password: '', agency: '', general: '' };

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Official Email / ID is required';
      isValid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address format';
      isValid = false;
    } else if (!email.endsWith('.gov.in') && !email.endsWith('.nic.in')) {
      newErrors.email = 'Access restricted to .gov.in or .nic.in domains';
      isValid = false;
    }

    // Password Validation
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    // Agency Validation
    if (!agency) {
      newErrors.agency = 'Please select your affiliated agency';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const success = await login(email, password, role, agency);
      if (success) {
        navigate('/dashboard');
      } else {
        setErrors(prev => ({ ...prev, general: 'Invalid credentials or unauthorized role for this agency.' }));
      }
    } catch (err) {
      setErrors(prev => ({ ...prev, general: 'Connection failed. Please try again.' }));
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('officer@rajpolice.gov.in');
    setPassword('Officer@123');
    setAgency('Rajasthan Police');
    setRole('Officer');
    setErrors({ email: '', password: '', agency: '', general: '' });
  };

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex z-10 min-h-[600px]">
        
        {/* LEFT SIDE DESIGN */}
        <div className="hidden lg:flex w-5/12 bg-navy-800 flex-col justify-between p-12 text-white relative overflow-hidden">
          {/* Background Image/Gradient overlay */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-navy-900/95 to-blue-900/90"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <Shield className="w-8 h-8 text-emerald-400" />
              <span className="font-bold text-xl tracking-wider">INTELLISHARE</span>
            </div>
            
            <h2 className="text-3xl font-bold leading-tight mb-6">
              Case Continuity &<br/>Investigative<br/>Understanding
            </h2>
            <p className="text-blue-100 text-sm leading-relaxed mb-8 opacity-90 border-l-2 border-emerald-500 pl-4">
              A secure intelligence layer designed to reduce information loss during officer transfers. We connect CCTNS, NCRB, and ESAKYA to provide instant context, not automated decisions.
            </p>
            
            <div className="space-y-4">
               <div className="flex gap-3 items-center text-sm">
                  <div className="p-2 bg-white/10 rounded-lg"><Layers size={16} className="text-blue-300" /></div>
                  <span className="text-blue-100">Unified Continuity Layer</span>
               </div>
               <div className="flex gap-3 items-center text-sm">
                  <div className="p-2 bg-white/10 rounded-lg"><BrainCircuit size={16} className="text-purple-300" /></div>
                  <span className="text-blue-100">Investigative Memory (AI)</span>
               </div>
               <div className="flex gap-3 items-center text-sm">
                  <div className="p-2 bg-white/10 rounded-lg"><FileText size={16} className="text-emerald-300" /></div>
                  <span className="text-blue-100">Read-Only Evidence View</span>
               </div>
            </div>
          </div>

          <div className="relative z-10 text-[10px] text-slate-400 uppercase tracking-widest font-medium mt-12">
            Secure Government Gateway • Audit Logged
          </div>
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="w-full lg:w-7/12 p-8 md:p-12 bg-white overflow-y-auto">
           <div className="max-w-md mx-auto h-full flex flex-col justify-center">
             
             <div className="text-center mb-8">
               <h1 className="text-2xl font-bold text-navy-900">Officer Login</h1>
               <p className="text-slate-500 text-sm mt-2">Access restricted to authorized investigative personnel.</p>
             </div>

             {errors.general && (
               <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-3 flex items-start gap-3">
                 <AlertTriangle className="text-red-500 shrink-0 w-5 h-5" />
                 <p className="text-sm text-red-700">{errors.general}</p>
               </div>
             )}

             <div className="mb-6 flex justify-end">
               <button 
                 onClick={fillDemoCredentials}
                 className="text-xs text-navy-600 hover:text-navy-800 font-medium flex items-center gap-1 bg-blue-50 px-2 py-1 rounded border border-blue-100 transition"
               >
                 <Info size={12} /> Auto-fill Demo Credentials
               </button>
             </div>

             <form onSubmit={handleSubmit} className="space-y-5">
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Agency</label>
                 <select 
                   value={agency}
                   onChange={(e) => {
                     setAgency(e.target.value);
                     if (e.target.value) setErrors(prev => ({ ...prev, agency: '' }));
                   }}
                   className={`w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-navy-600 bg-white text-slate-900 transition ${errors.agency ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'}`}
                 >
                   <option value="">Select Official Agency...</option>
                   <option>CBI</option>
                   <option>Delhi Police</option>
                   <option>Rajasthan Police</option>
                   <option>Mumbai Police</option>
                   <option>NIA</option>
                   <option>Cyber Cell</option>
                   <option>Narcotics Bureau</option>
                 </select>
                 {errors.agency && <p className="text-red-500 text-xs mt-1 font-medium">{errors.agency}</p>}
               </div>

               <div className="grid grid-cols-1 gap-4">
                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Agency Email / ID</label>
                   <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <User className={`h-5 w-5 ${errors.email ? 'text-red-400' : 'text-gray-400'}`} />
                     </div>
                     <input
                       type="email"
                       value={email}
                       onChange={(e) => {
                         setEmail(e.target.value);
                         if (e.target.value) setErrors(prev => ({ ...prev, email: '' }));
                       }}
                       className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent bg-white text-slate-900 transition ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'}`}
                       placeholder="admin@bprd.gov.in"
                     />
                   </div>
                   {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
                 </div>

                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Secure Password</label>
                   <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <Lock className={`h-5 w-5 ${errors.password ? 'text-red-400' : 'text-gray-400'}`} />
                     </div>
                     <input
                       type="password"
                       value={password}
                       onChange={(e) => {
                         setPassword(e.target.value);
                         if (e.target.value) setErrors(prev => ({ ...prev, password: '' }));
                       }}
                       className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent bg-white text-slate-900 transition ${errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'}`}
                       placeholder="••••••••"
                     />
                   </div>
                   {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>}
                 </div>
               </div>

               <div className="hidden">
                 {/* Hidden Role Selector - defaults to Officer, handled in logic or if we want to expose it back */}
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Access Role</label>
                 <select 
                   value={role}
                   onChange={(e) => setRole(e.target.value)}
                   className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-navy-600 bg-white text-slate-900"
                 >
                   <option>Officer</option>
                   <option>Analyst</option>
                   <option>Administrator</option>
                   <option>Read-Only</option>
                 </select>
               </div>

               <div className="flex items-center justify-between text-sm pt-2">
                 <label className="flex items-center text-gray-600 cursor-pointer select-none">
                   <input type="checkbox" className="rounded border-gray-300 text-navy-800 mr-2 focus:ring-navy-600" />
                   Remember device
                 </label>
                 <a href="#" className="text-navy-600 hover:text-navy-900 font-medium hover:underline">Forgot password?</a>
               </div>

               <button
                 type="submit"
                 disabled={loading}
                 className="w-full bg-navy-800 text-white py-3.5 rounded-lg font-bold hover:bg-navy-900 transition shadow-lg flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
               >
                 {loading ? (
                   <>
                     <Activity className="animate-spin w-5 h-5" /> Authenticating...
                   </>
                 ) : (
                   'Access Continuity Portal'
                 )}
               </button>
             </form>

             {/* Demo Credentials Footer */}
             <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-100 text-center">
                 <p className="text-xs text-slate-400 font-mono mb-1">Demo Credentials:</p>
                 <p className="text-xs text-slate-600 font-mono">admin@bprd.gov.in / Admin@123</p>
                 <p className="text-xs text-slate-600 font-mono">officer@rajpolice.gov.in / Officer@123</p>
             </div>
             
             <div className="mt-6 text-center">
                <p className="text-sm text-slate-600">
                  New Agency Personnel? <Link to="/register" className="text-navy-700 font-bold hover:underline">Register Official ID</Link>
                </p>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Login;