import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance'; 

export default function Register() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            await axiosInstance.post('/auth/register', {
                username: username,
                password: password
            });

            setMessage("Account created successfully! Redirecting to login...");
            
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            if (err.response && typeof err.response.data === 'string') {
                setError(err.response.data);
            } else {
                setError("Registration failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container" style={{ display: 'flex', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f3f4f6' }}>
            
            {/* Inline CSS (Same as Login to maintain seamless transition) */}
            <style>{`
                .auth-left {
                    flex: 1.1;
                    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                    color: white;
                    padding: 60px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    position: relative;
                    overflow: hidden;
                }
                .auth-right {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                    background-color: #f8fafc;
                }
                @media (max-width: 900px) {
                    .auth-left { display: none; }
                }
                .input-group {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .input-icon {
                    position: absolute;
                    left: 14px;
                    color: #94a3b8;
                    width: 18px;
                    height: 18px;
                }
                .input-field {
                    width: 100%;
                    padding: 12px 16px 12px 42px;
                    border-radius: 10px;
                    border: 1px solid #cbd5e1;
                    outline: none;
                    font-size: 14px;
                    background-color: #ffffff;
                    transition: all 0.2s;
                    box-sizing: border-box;
                }
                .input-field:focus {
                    border-color: #6366f1;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }
                .gradient-text {
                    background: linear-gradient(to right, #a5b4fc, #d8b4fe);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .floating-dashboard {
                    transform: perspective(1000px) rotateY(12deg) rotateX(4deg) rotateZ(-2deg);
                    box-shadow: -20px 20px 40px rgba(0,0,0,0.2);
                    border-radius: 12px;
                    background: rgba(255,255,255,0.95);
                    width: 110%;
                    height: 280px;
                    position: absolute;
                    right: -10%;
                    top: 40%;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .btn-primary {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                    padding: 14px;
                    border: none;
                    border-radius: 10px;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    transition: transform 0.1s, box-shadow 0.2s;
                    width: 100%;
                }
                .btn-primary:hover {
                    box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
                }
                .btn-primary:active {
                    transform: scale(0.98);
                }
            `}</style>

            {/* Left Promotional Pane */}
            <div className="auth-left">
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', zIndex: 10 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '28px', height: '28px', color: '#fff' }}>
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                        <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                    <span style={{ fontSize: '20px', fontWeight: '700' }}>Workspace<span style={{ fontWeight: '400', opacity: 0.8 }}>Hub</span></span>
                </div>

                {/* Hero Text */}
                <div style={{ zIndex: 10, marginTop: '-60px' }}>
                    <div style={{ display: 'inline-block', padding: '6px 14px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '20px', fontSize: '12px', fontWeight: '600', marginBottom: '24px', backdropFilter: 'blur(10px)' }}>
                        Join the workspace revolution 
                    </div>
                    <h1 style={{ fontSize: '48px', fontWeight: '800', margin: '0 0 16px 0', lineHeight: '1.1' }}>
                        Start tracking.<br/>
                        <span className="gradient-text">Build better.</span> 🛠️
                    </h1>
                    <p style={{ fontSize: '16px', lineHeight: '1.5', opacity: 0.9, maxWidth: '400px', margin: 0 }}>
                        Create your account in seconds and unlock the full potential of your team's workflow.
                    </p>
                </div>

                {/* 3D Floating Dashboard Graphic (CSS Only) */}
                <div className="floating-dashboard">
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></div>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></div>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
                        <div style={{ width: '40px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px' }}>
                            <div style={{ width: '100%', height: '24px', background: '#e0e7ff', borderRadius: '4px' }}></div>
                            <div style={{ width: '100%', height: '24px', background: '#e2e8f0', borderRadius: '4px' }}></div>
                            <div style={{ width: '100%', height: '24px', background: '#e2e8f0', borderRadius: '4px' }}></div>
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ height: '80px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}></div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1, height: '60px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}></div>
                                <div style={{ flex: 1, height: '60px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}></div>
                                <div style={{ flex: 1, height: '60px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Testimonial */}
                <div style={{ zIndex: 10, padding: '24px', backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', borderRadius: '16px', maxWidth: '420px', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <div style={{ fontSize: '32px', lineHeight: '0', color: '#a5b4fc', marginBottom: '16px' }}>❝</div>
                    <p style={{ fontSize: '14px', lineHeight: '1.5', margin: '0 0 16px 0', fontWeight: '500' }}>
                        We switched to Workspace Hub and our ticket resolution speed improved by 40% in the first week.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#475569' }}>S</div>
                        <div>
                            <div style={{ fontSize: '13px', fontWeight: '700' }}>Ravishek singh</div>
                            <div style={{ fontSize: '11px', opacity: 0.8 }}>Developer</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Authentication Form Pane */}
            <div className="auth-right">
                <div style={{ width: '100%', maxWidth: '440px', padding: '48px 40px', backgroundColor: '#ffffff', borderRadius: '24px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                    
                    {/* Form Header */}
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{ display: 'inline-flex', padding: '12px', background: '#ecfdf5', borderRadius: '14px', color: '#10b981', marginBottom: '16px' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '32px', height: '32px' }}>
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="8.5" cy="7" r="4"></circle>
                                <line x1="20" y1="8" x2="20" y2="14"></line>
                                <line x1="23" y1="11" x2="17" y2="11"></line>
                            </svg>
                        </div>
                        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>Create an Account</h2>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Join <span style={{ color: '#10b981', fontWeight: '600' }}>Workspace Hub</span> today</p>
                    </div>

                    {message && (
                        <div style={{ backgroundColor: '#ecfdf5', color: '#065f46', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #a7f3d0', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>✨</span> {message}
                        </div>
                    )}
                    {error && (
                        <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #fecaca', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        
                        {/* Username Input */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px', color: '#1e293b' }}>Username</label>
                            <div className="input-group">
                                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                <input 
                                    type="text" 
                                    className="input-field"
                                    placeholder="Choose a username"
                                    value={username} 
                                    onChange={(e) => setUsername(e.target.value)} 
                                    required 
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px', color: '#1e293b' }}>Password</label>
                            <div className="input-group">
                                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    className="input-field"
                                    placeholder="Create a secure password"
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '14px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, display: 'flex' }}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
                                        {showPassword ? (
                                            <>
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                <line x1="2" y1="2" x2="22" y2="22"></line>
                                            </>
                                        ) : (
                                            <>
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                <circle cx="12" cy="12" r="3"></circle>
                                            </>
                                        )}
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '12px' }}>
                            {loading ? 'Creating account...' : 'Create Account →'}
                        </button>
                    </form>

                    {/* Sign In Link */}
                    <div style={{ textAlign: 'center', marginTop: '36px', fontSize: '13px', color: '#64748b' }}>
                        Already have an account?{' '}
                        <button 
                            onClick={() => navigate('/login')} 
                            style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontWeight: '700', padding: 0, fontSize: '13px' }}
                        >
                            Sign in instead
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}