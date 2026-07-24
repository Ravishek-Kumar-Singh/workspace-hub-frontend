import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance'; 

export default function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await axiosInstance.post('/auth/login', {
                username: username,
                password: password
            });
            localStorage.setItem('token', response.data.jwt);
            navigate('/dashboard');
        } catch (err) {
            setError("Invalid credentials. Please check your username and password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <style>{`
                :root {
                    --primary-color: #6345ed;
                    --primary-hover: #5234d6;
                    --gradient-start: #3b28b6;
                    --gradient-end: #7c3aed;
                    --text-main: #0f172a;
                    --text-muted: #64748b;
                    --bg-light: #f4f5f9;
                    --border-color: #e2e8f0;
                }

                * { box-sizing: border-box; }
                
                body, html {
                    margin: 0; padding: 0;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                }

                .auth-wrapper {
                    display: flex;
                    min-height: 100vh;
                    width: 100vw;
                    background-color: var(--bg-light);
                }

                /* --- LEFT PANE --- */
                .auth-left {
                    flex: 1;
                    background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
                    color: white;
                    padding: 60px 80px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    position: relative;
                    overflow: hidden;
                    max-width: 55%;
                }

                .auth-logo {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 22px;
                    font-weight: 700;
                    z-index: 10;
                }

                .auth-logo span span {
                    font-weight: 400;
                    color: rgba(255,255,255,0.7);
                }

                .hero-content {
                    z-index: 10;
                    margin-top: -60px;
                }

                .hero-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    background-color: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 100px;
                    font-size: 13px;
                    font-weight: 500;
                    margin-bottom: 30px;
                    backdrop-filter: blur(10px);
                }

                .hero-title {
                    font-size: 56px;
                    font-weight: 800;
                    line-height: 1.1;
                    margin: 0 0 20px 0;
                    letter-spacing: -0.5px;
                }

                .hero-title-gradient {
                    background: linear-gradient(to right, #a5b4fc, #d8b4fe);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .hero-desc {
                    font-size: 17px;
                    line-height: 1.6;
                    color: rgba(255,255,255,0.8);
                    max-width: 420px;
                    margin: 0;
                }

                /* --- 3D FLOATING DASHBOARD --- */
                .mock-dashboard {
                    position: absolute;
                    right: -15%;
                    top: 38%;
                    width: 600px;
                    height: 380px;
                    background: #f8fafc;
                    border-radius: 16px;
                    box-shadow: -30px 40px 60px rgba(0,0,0,0.3);
                    transform: perspective(1200px) rotateY(-18deg) rotateX(8deg) rotateZ(3deg);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    border: 1px solid rgba(255,255,255,0.4);
                }

                .mock-header {
                    height: 30px;
                    background: #ffffff;
                    border-bottom: 1px solid #e2e8f0;
                    display: flex;
                    align-items: center;
                    padding: 0 16px;
                    gap: 8px;
                }

                .mock-dot { width: 10px; height: 10px; border-radius: 50%; }
                .mock-dot.r { background: #ff5f56; }
                .mock-dot.y { background: #ffbd2e; }
                .mock-dot.g { background: #27c93f; }

                .mock-body {
                    display: flex;
                    flex: 1;
                }

                .mock-sidebar {
                    width: 70px;
                    background: #ffffff;
                    border-right: 1px solid #e2e8f0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 20px 0;
                    gap: 16px;
                }

                .mock-sidebar-item {
                    width: 36px; height: 36px; border-radius: 10px; background: #f1f5f9;
                }
                .mock-sidebar-item.active { background: var(--primary-color); }

                .mock-content {
                    flex: 1;
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .mock-row-1 {
                    display: flex;
                    gap: 20px;
                    height: 160px;
                }

                .mock-card {
                    background: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
                    padding: 16px;
                    flex: 1;
                    border: 1px solid #e2e8f0;
                }

                .mock-row-2 {
                    display: flex;
                    gap: 20px;
                    flex: 1;
                }

                /* --- TESTIMONIAL --- */
                .testimonial-card {
                    z-index: 10;
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(12px);
                    border-radius: 20px;
                    padding: 24px;
                    max-width: 460px;
                }

                .testimonial-quote {
                    font-size: 40px;
                    line-height: 0;
                    color: #a5b4fc;
                    margin-bottom: 20px;
                    font-family: Georgia, serif;
                }

                /* --- RIGHT PANE --- */
                .auth-right {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                }

                .form-container {
                    background: #ffffff;
                    width: 100%;
                    max-width: 480px;
                    padding: 50px 48px;
                    border-radius: 32px;
                    box-shadow: 0 20px 60px -10px rgba(0,0,0,0.05);
                }

                .form-icon-wrapper {
                    width: 56px;
                    height: 56px;
                    background: #f3f0ff;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 24px auto;
                    color: var(--primary-color);
                }

                .form-header {
                    text-align: center;
                    margin-bottom: 36px;
                }

                .form-header h2 {
                    font-size: 28px;
                    font-weight: 800;
                    color: var(--text-main);
                    margin: 0 0 10px 0;
                }

                .form-header p {
                    font-size: 15px;
                    color: var(--text-muted);
                    margin: 0;
                }

                .input-group { margin-bottom: 20px; }
                .input-label {
                    display: block;
                    font-size: 13px;
                    font-weight: 700;
                    color: var(--text-main);
                    margin-bottom: 8px;
                }

                .input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .input-icon {
                    position: absolute;
                    left: 16px;
                    color: #94a3b8;
                    width: 18px;
                    height: 18px;
                }

                .input-field {
                    width: 100%;
                    height: 52px;
                    padding: 0 44px;
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    font-size: 14px;
                    color: var(--text-main);
                    transition: all 0.2s;
                    background: #ffffff;
                }

                .input-field:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 4px rgba(99, 69, 237, 0.1);
                }

                /* CUSTOM CHECKBOX */
                .remember-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 28px;
                }

                .custom-checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 13px;
                    color: var(--text-muted);
                    cursor: pointer;
                }

                .custom-checkbox {
                    appearance: none;
                    width: 18px;
                    height: 18px;
                    border: 2px solid var(--border-color);
                    border-radius: 4px;
                    background: #fff;
                    cursor: pointer;
                    position: relative;
                    transition: all 0.2s;
                }

                .custom-checkbox:checked {
                    background: var(--primary-color);
                    border-color: var(--primary-color);
                }

                .custom-checkbox:checked::after {
                    content: '';
                    position: absolute;
                    left: 5px;
                    top: 2px;
                    width: 4px;
                    height: 8px;
                    border: solid white;
                    border-width: 0 2px 2px 0;
                    transform: rotate(45deg);
                }

                .btn-submit {
                    width: 100%;
                    height: 52px;
                    background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
                    color: white;
                    font-size: 15px;
                    font-weight: 600;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 8px;
                    box-shadow: 0 10px 25px -5px rgba(99, 69, 237, 0.4);
                    transition: transform 0.1s, box-shadow 0.2s;
                }

                .btn-submit:hover {
                    box-shadow: 0 15px 30px -5px rgba(99, 69, 237, 0.5);
                }
                .btn-submit:active { transform: scale(0.98); }

                .divider {
                    display: flex;
                    align-items: center;
                    margin: 28px 0;
                    color: #cbd5e1;
                    font-size: 12px;
                }
                .divider::before, .divider::after {
                    content: ''; flex: 1; height: 1px; background: #f1f5f9;
                }
                .divider span { padding: 0 16px; }

                .btn-google {
                    width: 100%;
                    height: 52px;
                    background: white;
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-main);
                    cursor: pointer;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 12px;
                    transition: background 0.2s;
                }
                .btn-google:hover { background: #f8fafc; }

                .signup-link {
                    text-align: center;
                    margin-top: 32px;
                    font-size: 14px;
                    color: var(--text-muted);
                }

                .signup-link button {
                    background: none; border: none; padding: 0;
                    color: var(--primary-color);
                    font-weight: 700; cursor: pointer; font-size: 14px;
                }

                @media (max-width: 1000px) {
                    .auth-left { display: none; }
                    .auth-right { background: var(--bg-light); padding: 20px; }
                }
            `}</style>

            {/* LEFT PANE */}
            <div className="auth-left">
                {/* Isometric Logo */}
                <div className="auth-logo">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '32px', height: '32px' }}>
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 7v10M22 7v10M12 22V12" />
                    </svg>
                    <span>Workspace <span>Hub</span></span>
                </div>

                <div className="hero-content">
                    <div className="hero-badge">
                        Issue Tracking Made Simple 
                    </div>
                    <h1 className="hero-title">
                        Manage. Track.<br/>
                        <span className="hero-title-gradient">Ship Faster.</span>
                    </h1>
                    </div>
                    
                

                {/* 3D Dashboard Replica */}
                <div className="mock-dashboard">
                    <div className="mock-header">
                        <div className="mock-dot r"></div>
                        <div className="mock-dot y"></div>
                        <div className="mock-dot g"></div>
                    </div>
                    <div className="mock-body">
                        <div className="mock-sidebar">
                            <div className="mock-sidebar-item active"></div>
                            <div className="mock-sidebar-item"></div>
                            <div className="mock-sidebar-item"></div>
                        </div>
                        <div className="mock-content">
                            <div className="mock-row-1">
                                <div className="mock-card" style={{ flex: 2, position: 'relative' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>Project Overview</div>
                                    <svg viewBox="0 0 200 60" style={{ width: '100%', height: '80%' }}>
                                        <path d="M 0 50 C 30 50, 40 20, 70 30 C 100 40, 110 10, 140 20 C 170 30, 180 50, 200 40" fill="none" stroke="#6345ed" strokeWidth="4" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <div className="mock-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', marginBottom: '8px', alignSelf: 'flex-start' }}>Tasks</div>
                                    <svg viewBox="0 0 36 36" style={{ width: '60px', height: '60px' }}>
                                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#6345ed" strokeWidth="6" strokeDasharray="60, 100" />
                                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#ffbd2e" strokeWidth="6" strokeDasharray="20, 100" strokeDashoffset="-60" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mock-row-2">
                                <div className="mock-card">
                                    <div style={{ fontSize: '10px', color: '#64748b' }}>Total Issues</div>
                                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>128</div>
                                </div>
                                <div className="mock-card">
                                    <div style={{ fontSize: '10px', color: '#64748b' }}>In Progress</div>
                                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>72</div>
                                </div>
                                <div className="mock-card">
                                    <div style={{ fontSize: '10px', color: '#64748b' }}>Completed</div>
                                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>56</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Testimonial */}
                <div className="testimonial-card">
                    <div className="testimonial-quote"></div>
                    <p style={{ fontSize: '15px', lineHeight: '1.6', margin: '0 0 20px 0', fontWeight: '600' }}>
                        Workspace Hub has completely streamlined our workflow and boosted team productivity.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src="https://ui-avatars.com/api/?name=Ravi+Sharma&background=random" alt="Ravishek Singh" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: '700' }}>Ravishek singh</div>
                            <div style={{ fontSize: '12px', opacity: 0.8 }}>Product Manager</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT PANE */}
            <div className="auth-right">
                <div className="form-container">
                    
                    <div className="form-icon-wrapper">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '28px', height: '28px' }}>
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 7v10M22 7v10M12 22V12" />
                        </svg>
                    </div>

                    <div className="form-header">
                        <h2>Welcome Back! </h2>
                        <p>Sign in to continue to <span style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Workspace Hub</span></p>
                    </div>

                    {error && (
                        <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '14px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #fecaca', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin}>
                        {/* Username */}
                        <div className="input-group">
                            <label className="input-label">Username</label>
                            <div className="input-wrapper">
                                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                <input 
                                    type="text" 
                                    className="input-field"
                                    placeholder="Enter your username"
                                    value={username} 
                                    onChange={(e) => setUsername(e.target.value)} 
                                    required 
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="input-group">
                            <label className="input-label">Password</label>
                            <div className="input-wrapper">
                                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    className="input-field"
                                    placeholder="Enter your password"
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '16px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, display: 'flex' }}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '20px', height: '20px' }}>
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

                        {/* Remember Me & Forgot */}
                        <div className="remember-row">
                            <label className="custom-checkbox-label">
                                <input 
                                    type="checkbox" 
                                    className="custom-checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                Remember me
                            </label>
                            <span style={{ fontSize: '13px', color: 'var(--primary-color)', fontWeight: '600', cursor: 'pointer' }}>Forgot password?</span>
                        </div>

                        {/* Sign In Button */}
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In →'}
                        </button>
                    </form>

                    <div className="divider">
                        <span>OR</span>
                    </div>

                    {/* Google Button */}
                    <button className="btn-google">
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Continue with Google
                    </button>

                    <div className="signup-link">
                        Don't have an account?{' '}
                        <button onClick={() => navigate('/register')}>Create an account</button>
                    </div>

                </div>
            </div>
        </div>
    );
}