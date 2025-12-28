import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, UserPlus, Check, X, RefreshCw, AlertCircle } from 'lucide-react';

const AGENCIES = ['CBI', 'State Police', 'Intelligence Bureau', 'Cyber Crime', 'Narcotics Bureau', 'Customs'];
const ROLES = ['Officer', 'Analyst', 'Read-Only']; // Admin usually manually created

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Personal, 2: Security
  const [captcha, setCaptcha] = useState({ q: '', a: 0 });
  const [captchaInput, setCaptchaInput] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    badgeNumber: '',
    agency: AGENCIES[0],
    department: '',
    role: ROLES[0],
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });

  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    generateCaptcha();
  }, []);

  useEffect(() => {
    // Simple strength calculator
    const pwd = formData.password;
    let strength = 0;
    if (pwd.length > 7) strength++;
    if (pwd.match(/[a-z]/) && pwd.match(/[A-Z]/)) strength++;
    if (pwd.match(/\d/)) strength++;
    if (pwd.match(/[^a-zA-Z\d]/)) strength++;
    setPasswordStrength(strength);
  }, [formData.password]);

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptcha({ q: `${num1} + ${num2}`, a: num1 + num2 });
    setCaptchaInput('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    
    if (parseInt(captchaInput) !== captcha.a) {
      alert("Incorrect Captcha");
      generateCaptcha();
      return;
    }

    setLoading(true);
    
    try {
      const success = await register({
        name: formData.name,
        email: formData.email,
        badgeNumber: formData.badgeNumber,
        agency: formData.agency,
        role: formData.role as any,
        password: formData.password
      });

      if (success) {
        navigate('/dashboard');
      } else {
        alert('Registration failed. Email might be in use.');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4 relative">
       {/* Background decorations */}
       <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-navy-800 to-transparent opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-900 rounded-full blur-[120px] opacity-20"></div>
      </div>

      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex z-10 min-h-[600px]">
        
        {/* Left Side - Visual */}
        <div className="hidden lg:flex w-5/12 bg-slate-100 flex-col items-center justify-center p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-navy-900 opacity-90 z-10"></div>
          <img src="https://images.unsplash.com/photo-1555529733-0e670560f7e1?auto=format&fit=crop&q=80&w=1000" alt="Security" className="absolute inset-0 w-full h-full object-cover" />
          
          <div className="relative z-20 text-white">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/20">
              <Shield className="w-10 h-10 text-blue-200" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Join IntelliShare</h2>
            <p className="text-blue-100 text-sm leading-relaxed mb-8">
              Secure inter-agency collaboration platform for verified law enforcement personnel.
            </p>
            <div className="space-y-4 text-left text-sm bg-white/5 p-6 rounded-lg border border-white/10">
              <div className="flex items-center gap-3">
                <Check className="text-emerald-400 w-5 h-5" /> <span>Encrypted Data Storage</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="text-emerald-400 w-5 h-5" /> <span>Real-time Intel Sharing</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="text-emerald-400 w-5 h-5" /> <span>AI-Powered Analytics</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-7/12 p-8 md:p-12 overflow-y-auto max-h-[90vh]">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-navy-900">Officer Registration</h2>
            <div className="text-sm font-medium text-slate-500">
              Step {step} of 2
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-5 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-1">Full Name (Official Record)</label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full border border-slate-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-navy-600 focus:outline-none transition"
                      placeholder="e.g. Inspector Vikram Singh"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Badge Number</label>
                    <input
                      type="text"
                      name="badgeNumber"
                      required
                      className="w-full border border-slate-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-navy-600 focus:outline-none transition uppercase"
                      placeholder="MH-2024-XXXX"
                      value={formData.badgeNumber}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Role Request</label>
                    <select
                      name="role"
                      className="w-full border border-slate-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-navy-600 focus:outline-none transition bg-white"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Agency</label>
                    <select
                      name="agency"
                      className="w-full border border-slate-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-navy-600 focus:outline-none transition bg-white"
                      value={formData.agency}
                      onChange={handleChange}
                    >
                      {AGENCIES.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Department</label>
                    <input
                      type="text"
                      name="department"
                      className="w-full border border-slate-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-navy-600 focus:outline-none transition"
                      placeholder="e.g. Major Crimes"
                      value={formData.department}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-1">Official Email</label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full border border-slate-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-navy-600 focus:outline-none transition"
                      placeholder="name@agency.gov.in"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={10} /> Must use official .gov.in domain
                    </p>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                   <button 
                     type="button"
                     onClick={() => setStep(2)}
                     className="bg-navy-800 text-white px-6 py-2.5 rounded-md font-bold hover:bg-navy-700 transition"
                   >
                     Next: Security Setup
                   </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 animate-fade-in">
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1">Create Password</label>
                   <input
                      type="password"
                      name="password"
                      required
                      className="w-full border border-slate-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-navy-600 focus:outline-none transition"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    {/* Strength Indicator */}
                    <div className="flex gap-1 mt-2 h-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${
                          passwordStrength >= i 
                            ? (passwordStrength < 3 ? 'bg-orange-400' : 'bg-emerald-500') 
                            : 'bg-slate-200'
                        }`}></div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Use 8+ chars, mix of uppercase, numbers & symbols.
                    </p>
                </div>
                
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1">Confirm Password</label>
                   <input
                      type="password"
                      name="confirmPassword"
                      required
                      className="w-full border border-slate-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-navy-600 focus:outline-none transition"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Human Verification</label>
                  <div className="flex items-center gap-4">
                    <div className="bg-white border border-slate-300 px-4 py-2 rounded font-mono text-lg font-bold text-slate-700 tracking-widest select-none bg-opacity-50" style={{backgroundImage: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNjY2MiPjwvcmVjdD4KPC9zdmc+")'}}>
                      {captcha.q} = ?
                    </div>
                    <button type="button" onClick={generateCaptcha} className="text-slate-400 hover:text-navy-700"><RefreshCw size={18} /></button>
                    <input
                      type="number"
                      required
                      className="w-20 border border-slate-300 rounded px-3 py-2 text-center font-bold"
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2">
                   <input 
                     type="checkbox" 
                     id="terms" 
                     name="termsAccepted"
                     required
                     className="mt-1"
                     onChange={handleChange as any}
                   />
                   <label htmlFor="terms" className="text-sm text-slate-600 leading-tight">
                     I certify that I am a sworn law enforcement officer or authorized analyst. I agree to the <a href="#" className="text-navy-700 underline font-bold">Data Privacy Act</a> and understand that unauthorized access is a felony.
                   </label>
                </div>

                <div className="pt-4 flex justify-between">
                   <button 
                     type="button"
                     onClick={() => setStep(1)}
                     className="text-slate-500 font-bold hover:text-navy-800 transition text-sm px-4"
                   >
                     Back
                   </button>
                   <button 
                     type="submit"
                     disabled={loading || !formData.termsAccepted}
                     className="bg-navy-800 text-white px-8 py-2.5 rounded-md font-bold hover:bg-navy-700 transition shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {loading ? 'Verifying...' : 'Submit Application'} <UserPlus size={18} />
                   </button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
             <p className="text-sm text-slate-600">
               Already have an account? <Link to="/" className="text-navy-700 font-bold hover:underline">Secure Login</Link>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;