import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../api/axiosInstance';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Dashboard() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('Dashboard');
    
    // Theme and Dropdown states
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const [issues, setIssues] = useState([]);
    const [users, setUsers] = useState([]);
    const [activities, setActivities] = useState([
        { id: 1, text: 'System initialized successfully', time: 'Just now' }
    ]);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assignee, setAssignee] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [dueDate, setDueDate] = useState('');
    const [attachmentName, setAttachmentName] = useState('');
    const [aiLoading, setAiLoading] = useState(false);

    const [editingIssue, setEditingIssue] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editStatus, setEditStatus] = useState('');
    const [editAssignee, setEditAssignee] = useState('');
    const [editPriority, setEditPriority] = useState('Medium');
    const [editDueDate, setEditDueDate] = useState('');

    const [selectedIssueForComments, setSelectedIssueForComments] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    // Dynamic Theme Configurations
    const themeStyles = {
        light: {
            bgMain: '#f8fafc',
            bgPanel: '#ffffff',
            bgInput: '#f1f5f9',
            border: '#e2e8f0',
            textMain: '#0f172a',
            textMuted: '#64748b',
            modalBg: 'rgba(15, 23, 42, 0.6)',
            kanbanBg: '#f1f5f9',
            ticketBg: '#ffffff',
            ticketHover: '#f8fafc',
            dangerBg: '#fee2e2',
            dangerText: '#ef4444',
            warningBg: '#fef3c7',
            warningText: '#d97706',
            successBg: '#d1fae5',
            successText: '#059669',
            tableHeader: '#f8fafc'
        },
        dark: {
            bgMain: '#0b0f19',
            bgPanel: '#0f172a',
            bgInput: '#131b2e',
            border: '#1e293b',
            textMain: '#f8fafc',
            textMuted: '#94a3b8',
            modalBg: 'rgba(0, 0, 0, 0.7)',
            kanbanBg: '#0f172a',
            ticketBg: '#131b2e',
            ticketHover: '#1e293b',
            dangerBg: 'rgba(239,68,68,0.15)',
            dangerText: '#ef4444',
            warningBg: 'rgba(245,158,11,0.15)',
            warningText: '#f59e0b',
            successBg: 'rgba(16,185,129,0.15)',
            successText: '#10b981',
            tableHeader: '#131b2e'
        }
    };

    const t = isDarkMode ? themeStyles.dark : themeStyles.light;

    useEffect(() => {
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        try {
            const decodedToken = jwtDecode(token);
            setUsername(decodedToken.sub);
            if (decodedToken.roles && decodedToken.roles.length > 0) {
                setRole(decodedToken.roles[0]);
            }
            fetchIssues();
            fetchUsers();
        } catch (error) {
            console.error("Invalid token format", error);
            localStorage.removeItem('token');
            navigate('/login');
        }
    }, [navigate]);

    const addActivity = (text) => {
        setActivities(prev => [{ id: Date.now(), text, time: 'Just now' }, ...prev.slice(0, 9)]);
    };

    const fetchIssues = async () => {
        try {
            const response = await axiosInstance.get('/issues');
            setIssues(response.data);
        } catch (error) {
            console.error("Error fetching issues:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axiosInstance.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleAiMagicFill = async () => {
        if (!title.trim()) {
            setErrorMsg("Please enter a title first so Gemini AI can generate a description!");
            return;
        }
        setAiLoading(true);
        setErrorMsg('');
        try {
            const apiKey = "enter the url lnk"; // Make sure to use secure env vars in prod
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
            const payload = {
                contents: [{
                    role: "user",
                    parts: [{ text: `You are an expert technical product manager. Given the ticket title "${title}", write a concise, professional 1 sentence description for this issue tracker ticket.` }]
                }]
            };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            const candidate = result.candidates?.[0];
            if (candidate && candidate.content?.parts?.[0]?.text) {
                setDescription(candidate.content.parts[0].text.trim());
            } else {
                setErrorMsg("AI failed to generate a description. Please try again.");
            }
        } catch (err) {
            console.error("AI Generation Error:", err);
            setErrorMsg("Failed to connect to Gemini AI.");
        } finally {
            setAiLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAttachmentName(file.name);
        }
    };

    const handleCreateIssue = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        try {
            const response = await axiosInstance.post('/issues', {
                title: title,
                description: description,
                assignee: assignee || 'Unassigned',
                priority: priority,
                dueDate: dueDate || null,
                attachment: attachmentName || null
            });
            setIssues([response.data, ...issues]);
            addActivity(`${username} created ticket "${title}"`);
            setTitle('');
            setDescription('');
            setAssignee('');
            setPriority('Medium');
            setDueDate('');
            setAttachmentName('');
            setActiveTab('Dashboard');
        } catch (error) {
            console.error("Error creating issue:", error);
            setErrorMsg("Failed to create ticket.");
        }
    };

    const handleDeleteIssue = async (id) => {
        setErrorMsg('');
        try {
            await axiosInstance.delete(`/admin/issues/${id}`);
            const deleted = issues.find(i => i.id === id);
            setIssues(issues.filter(issue => issue.id !== id));
            addActivity(`Admin deleted issue "${deleted ? deleted.title : id}"`);
        } catch (error) {
            console.error("Error deleting issue:", error);
            setErrorMsg("Access Denied! You do not have Admin privileges.");
        }
    };

    const handleEditClick = (issue) => {
        setEditingIssue(issue);
        setEditTitle(issue.title);
        setEditDescription(issue.description);
        setEditStatus(issue.status);
        setEditAssignee(issue.assignee || '');
        setEditPriority(issue.priority || 'Medium');
        setEditDueDate(issue.dueDate || '');
    };

    const handleUpdateIssue = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.put(`/issues/${editingIssue.id}`, {
                title: editTitle,
                description: editDescription,
                status: editStatus,
                assignee: editAssignee,
                priority: editPriority,
                dueDate: editDueDate
            });
            setIssues(issues.map(issue => issue.id === editingIssue.id ? response.data : issue));
            addActivity(`${username} updated ticket status to "${editStatus}"`);
            setEditingIssue(null);
        } catch (error) {
            console.error("Error updating issue:", error);
            setErrorMsg("Failed to update the issue.");
        }
    };

    const handleDragStart = (e, issueId) => {
        e.dataTransfer.setData("issueId", issueId);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = async (e, newStatus) => {
        const issueId = e.dataTransfer.getData("issueId");
        const issueToMove = issues.find(i => i.id === parseInt(issueId));

        if (!issueToMove || issueToMove.status === newStatus) return;

        setIssues(issues.map(i => i.id === parseInt(issueId) ? { ...i, status: newStatus } : i));
        addActivity(`${username} moved "${issueToMove.title}" to ${newStatus}`);

        try {
            await axiosInstance.put(`/issues/${issueId}`, {
                ...issueToMove,
                status: newStatus
            });
        } catch (error) {
            console.error("Error saving moved issue:", error);
            setErrorMsg("Failed to save moved issue. Refreshing board.");
            fetchIssues();
        }
    };

    const openComments = async (issue) => {
        setSelectedIssueForComments(issue);
        try {
            const response = await axiosInstance.get(`/comments/issue/${issue.id}`);
            setComments(response.data);
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const response = await axiosInstance.post(`/comments/issue/${selectedIssueForComments.id}`, {
                text: newComment
            });
            setComments([...comments, response.data]);
            setNewComment('');
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const columns = ["To Do", "In Progress", "Done"];

    const filteredIssues = issues.filter(issue =>
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (issue.assignee && issue.assignee.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const myTickets = filteredIssues.filter(i => i.createdBy === username);
    const assignedToMeTickets = filteredIssues.filter(i => i.assignee === username);

    const totalTickets = issues.length;
    const todoCount = issues.filter(i => i.status === 'To Do').length;
    const inProgressCount = issues.filter(i => i.status === 'In Progress').length;
    const doneCount = issues.filter(i => i.status === 'Done').length;
    const totalEmployees = users.length > 0 ? users.length : 2;

    const chartData = columns.map(col => ({
        name: col,
        Tickets: filteredIssues.filter(issue => issue.status === col).length
    }));

    const COLORS = ['#6366f1', '#f59e0b', '#10b981'];

    // Helper: Render Ticket Tables (All Tickets, My Tickets, etc)
    const renderTicketTable = (ticketList, titleStr) => (
        <div style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '28px', fontWeight: '800', color: t.textMain, margin: 0 }}>{titleStr}</h2>
                    <p style={{ color: t.textMuted, margin: '8px 0 0 0', fontSize: '14px' }}>Showing {ticketList.length} tickets</p>
                </div>
                <button 
                    onClick={() => setActiveTab('Dashboard')}
                    style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }}
                >
                    <span>+</span> Create New
                </button>
            </div>

            <div style={{ backgroundColor: t.bgPanel, borderRadius: '16px', border: `1px solid ${t.border}`, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: t.tableHeader, borderBottom: `1px solid ${t.border}` }}>
                            <th style={{ padding: '16px 24px', color: t.textMuted, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ticket ID</th>
                            <th style={{ padding: '16px 24px', color: t.textMuted, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Title</th>
                            <th style={{ padding: '16px 24px', color: t.textMuted, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                            <th style={{ padding: '16px 24px', color: t.textMuted, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Priority</th>
                            <th style={{ padding: '16px 24px', color: t.textMuted, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assignee</th>
                            <th style={{ padding: '16px 24px', color: t.textMuted, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reporter</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ticketList.map(issue => {
                            const rawPriority = (issue.priority || 'Medium').toString().toLowerCase();
                            const isHigh = rawPriority.includes('high');
                            const isMed = rawPriority.includes('med');
                            const priorityColor = isHigh ? t.dangerText : isMed ? t.warningText : t.successText;
                            const priorityBg = isHigh ? t.dangerBg : isMed ? t.warningBg : t.successBg;
                            const statusColor = issue.status === 'To Do' ? '#6366f1' : issue.status === 'In Progress' ? '#f59e0b' : '#10b981';

                            return (
                                <tr key={issue.id} style={{ borderBottom: `1px solid ${t.border}`, transition: 'background 0.2s', backgroundColor: t.bgPanel }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = t.bgInput} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = t.bgPanel}>
                                    <td style={{ padding: '16px 24px', color: t.textMuted, fontSize: '14px', fontFamily: 'monospace' }}>{issue.ticketKey || `#TCK-00${issue.id}`}</td>
                                    <td style={{ padding: '16px 24px', color: t.textMain, fontSize: '14px', fontWeight: '600' }}>{issue.title}</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{ color: statusColor, fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: statusColor }}></span>
                                            {issue.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{ fontSize: '12px', fontWeight: '700', backgroundColor: priorityBg, color: priorityColor, padding: '4px 10px', borderRadius: '6px' }}>
                                            {issue.priority || 'Medium'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px', color: t.textMuted, fontSize: '14px' }}>{issue.assignee || 'Unassigned'}</td>
                                    <td style={{ padding: '16px 24px', color: t.textMuted, fontSize: '13px', opacity: 0.8 }}>{issue.createdBy || 'System'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {ticketList.length === 0 && (
                    <div style={{ padding: '60px', textAlign: 'center', color: t.textMuted, fontStyle: 'italic', fontSize: '15px' }}>
                        No tickets found for this view.
                    </div>
                )}
            </div>
        </div>
    );

    // Helper: Render Users List
    const renderUsersDirectory = () => (
        <div style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', boxSizing: 'border-box' }}>
            <div>
                <h2 style={{ fontSize: '28px', fontWeight: '800', color: t.textMain, margin: 0 }}>System Users</h2>
                <p style={{ color: t.textMuted, margin: '8px 0 0 0', fontSize: '14px' }}>Manage all members within your Workspace Hub.</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {users.map((u, i) => (
                    <div key={i} style={{ backgroundColor: t.bgPanel, padding: '24px', borderRadius: '20px', border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: '20px', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'}} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}>
                        <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#fff', fontSize: '22px', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
                            {u.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style={{ fontSize: '18px', fontWeight: '800', color: t.textMain, marginBottom: '4px' }}>{u}</div>
                            <div style={{ fontSize: '13px', color: t.textMuted, fontWeight: '500' }}>Workspace Member</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // Helper: Render Coming Soon
    const renderComingSoon = (title) => (
        <div style={{ padding: '60px 36px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <span style={{ fontSize: '64px', marginBottom: '24px' }}>🚧</span>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: t.textMain, margin: '0 0 12px 0' }}>{title} Module</h2>
            <p style={{ color: t.textMuted, fontSize: '16px', maxWidth: '400px', lineHeight: '1.6' }}>This feature is currently under active development and will be available in an upcoming release.</p>
            <button 
                onClick={() => setActiveTab('Dashboard')}
                style={{ marginTop: '32px', padding: '12px 24px', backgroundColor: t.bgInput, color: t.textMain, border: `1px solid ${t.border}`, borderRadius: '10px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
            >
                Return to Dashboard
            </button>
        </div>
    );

    return (
        <div style={{ display: 'flex', width: '100vw', minHeight: '100vh', backgroundColor: t.bgMain, color: t.textMain, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', margin: 0, padding: 0, overflowX: 'hidden', boxSizing: 'border-box', transition: 'background-color 0.3s ease, color 0.3s ease' }}>
            
            {/* SIDEBAR */}
            <aside style={{ width: '260px', backgroundColor: t.bgPanel, borderRight: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0, minHeight: '100vh', position: 'sticky', top: 0, transition: 'background-color 0.3s ease, border-color 0.3s ease' }}>
                <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: `1px solid ${t.border}` }}>
                    <div style={{ width: '36px', height: '36px', backgroundColor: '#6366f1', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px', color: '#fff', boxShadow: '0 4px 12px rgba(99,102,241,0.4)' }}>
                        W
                    </div>
                    <span style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.5px', color: t.textMain }}>WorkspaceHub</span>
                </div>

                <div style={{ padding: '20px 16px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div>
                        <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: t.textMuted, letterSpacing: '0.8px', marginBottom: '8px', paddingLeft: '12px' }}>Main</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {['Dashboard', 'All Tickets', 'My Tickets', 'Assigned To Me', 'Reports', 'Calendar'].map((item) => (
                                <button 
                                    key={item} 
                                    onClick={() => setActiveTab(item)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '10px', border: 'none', background: activeTab === item ? 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)' : 'transparent', color: activeTab === item ? '#ffffff' : t.textMuted, cursor: 'pointer', fontWeight: '600', fontSize: '14px', textAlign: 'left', width: '100%', transition: 'all 0.2s' }}
                                >
                                    <span>{item === 'Dashboard' ? '📊' : item === 'All Tickets' ? '📋' : item === 'My Tickets' ? '👤' : item === 'Assigned To Me' ? '🎯' : item === 'Reports' ? '📈' : '📅'}</span>
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: t.textMuted, letterSpacing: '0.8px', marginBottom: '8px', paddingLeft: '12px' }}>Management</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {['Users', 'Teams', 'Projects', 'Activity'].map((item) => (
                                <button key={item} onClick={() => setActiveTab(item)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '10px', border: 'none', background: activeTab === item ? 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)' : 'transparent', color: activeTab === item ? '#ffffff' : t.textMuted, cursor: 'pointer', fontWeight: '600', fontSize: '14px', textAlign: 'left', width: '100%' }}>
                                    <span>{item === 'Users' ? '👥' : item === 'Teams' ? '🛡️' : item === 'Projects' ? '📁' : '⚡'}</span>
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: t.textMuted, letterSpacing: '0.8px', marginBottom: '8px', paddingLeft: '12px' }}>System</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {['Settings', 'Profile'].map((item) => (
                                <button key={item} onClick={() => setActiveTab(item)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '10px', border: 'none', background: activeTab === item ? 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)' : 'transparent', color: activeTab === item ? '#ffffff' : t.textMuted, cursor: 'pointer', fontWeight: '600', fontSize: '14px', textAlign: 'left', width: '100%' }}>
                                    <span>{item === 'Settings' ? '⚙️' : '👤'}</span>
                                    {item}
                                </button>
                            ))}
                            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '10px', border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontWeight: '600', fontSize: '14px', textAlign: 'left', width: '100%' }}>
                                <span>🚪</span> Logout
                            </button>
                        </div>
                    </div>
                </div>

                {/* Upgrade Box */}
                <div style={{ padding: '16px', margin: '16px', backgroundColor: t.bgInput, borderRadius: '16px', border: `1px solid ${t.border}` }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: t.textMain, marginBottom: '4px' }}>Upgrade to Pro 🚀</div>
                    <div style={{ fontSize: '11px', color: t.textMuted, marginBottom: '12px', lineHeight: '1.4' }}>Unlock advanced reports, custom fields, and AI copilot.</div>
                    <button style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '12px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
                        Upgrade Now →
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, backgroundColor: t.bgMain, minHeight: '100vh', transition: 'background-color 0.3s ease' }}>
                
                {/* TOP NAVIGATION BAR */}
                <header style={{ height: '76px', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 36px', backgroundColor: t.bgPanel, position: 'sticky', top: 0, zIndex: 50, transition: 'background-color 0.3s ease, border-color 0.3s ease' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, maxWidth: '500px' }}>
                        <div style={{ position: 'relative', width: '100%' }}>
                            <input 
                                type="text" 
                                placeholder={`🔍 Search in ${activeTab}...`} 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ width: '100%', padding: '10px 16px 10px 38px', backgroundColor: t.bgInput, border: `1px solid ${t.border}`, borderRadius: '12px', color: t.textMain, outline: 'none', fontSize: '14px', transition: 'all 0.2s' }}
                            />
                            <span style={{ position: 'absolute', left: '12px', top: '11px', color: t.textMuted, fontSize: '14px' }}>⌘K</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div onClick={() => alert('Notifications coming soon!')} style={{ width: '36px', height: '36px', backgroundColor: t.bgInput, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${t.border}`, cursor: 'pointer', color: t.textMain }}>🔔</div>
                        
                        {/* Theme Toggle Button */}
                        <div 
                            onClick={() => setIsDarkMode(!isDarkMode)} 
                            style={{ width: '36px', height: '36px', backgroundColor: t.bgInput, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${t.border}`, cursor: 'pointer', color: t.textMain, fontSize: '18px' }}
                            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            {isDarkMode ? '☀️' : '🌙'}
                        </div>
                        
                        {/* Interactive Profile Dropdown */}
                        <div style={{ position: 'relative' }}>
                            <div 
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '12px', borderLeft: `1px solid ${t.border}`, cursor: 'pointer' }}
                            >
                                <div style={{ width: '38px', height: '38px', backgroundColor: '#4f46e5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>
                                    {username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '700', color: t.textMain }}>{username}</div>
                                    <div style={{ fontSize: '11px', color: t.textMuted, textTransform: 'uppercase' }}>{role === 'ROLE_ADMIN' ? 'Administrator' : 'Employee'}</div>
                                </div>
                            </div>

                            {/* Dropdown Menu Popup */}
                            {isProfileMenuOpen && (
                                <div style={{ position: 'absolute', top: '100%', right: '0', marginTop: '12px', width: '220px', backgroundColor: t.bgPanel, borderRadius: '12px', border: `1px solid ${t.border}`, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', overflow: 'hidden', zIndex: 100 }}>
                                    <div style={{ padding: '16px', borderBottom: `1px solid ${t.border}` }}>
                                        <div style={{ fontWeight: '700', color: t.textMain, fontSize: '14px' }}>{username}</div>
                                        <div style={{ fontSize: '12px', color: t.textMuted }}>user@workspace.hub</div>
                                    </div>
                                    <div style={{ padding: '8px' }}>
                                        <button onClick={() => { setActiveTab('Profile'); setIsProfileMenuOpen(false); }} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', background: 'transparent', border: 'none', color: t.textMain, cursor: 'pointer', borderRadius: '8px', fontSize: '13px', fontWeight: '500' }} onMouseEnter={(e) => e.target.style.backgroundColor = t.bgInput} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>👤 My Profile</button>
                                        <button onClick={() => { setActiveTab('Settings'); setIsProfileMenuOpen(false); }} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', background: 'transparent', border: 'none', color: t.textMain, cursor: 'pointer', borderRadius: '8px', fontSize: '13px', fontWeight: '500' }} onMouseEnter={(e) => e.target.style.backgroundColor = t.bgInput} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>⚙️ Settings</button>
                                    </div>
                                    <div style={{ padding: '8px', borderTop: `1px solid ${t.border}` }}>
                                        <button onClick={handleLogout} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>🚪 Sign Out</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {activeTab === 'Dashboard' && (
                    <div style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '32px', width: '100%', boxSizing: 'border-box' }}>
                        
                        {/* GREETING & NEW TICKET BUTTON */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: t.textMain, letterSpacing: '-0.5px' }}>
                                    Good Morning, {username}! 👋
                                </h1>
                                <p style={{ margin: '6px 0 0 0', color: t.textMuted, fontSize: '14px' }}>Here's what's happening with your projects today.</p>
                            </div>
                            <button 
                                onClick={() => window.scrollTo({ top: 350, behavior: 'smooth' })}
                                style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 16px rgba(79,70,229,0.4)', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <span>+</span> New Ticket
                            </button>
                        </div>

                        {/* KPI METRIC CARDS */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '20px' }}>
                            <div style={{ backgroundColor: t.bgPanel, padding: '20px', borderRadius: '16px', border: `1px solid ${t.border}` }}>
                                <div style={{ fontSize: '12px', color: t.textMuted, fontWeight: '600', marginBottom: '8px' }}>Total Tickets</div>
                                <div style={{ fontSize: '24px', fontWeight: '800', color: t.textMain, marginBottom: '6px' }}>{totalTickets}</div>
                                <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '600' }}>↗ 12% from last week</div>
                            </div>
                            <div style={{ backgroundColor: t.bgPanel, padding: '20px', borderRadius: '16px', border: `1px solid ${t.border}` }}>
                                <div style={{ fontSize: '12px', color: '#6366f1', fontWeight: '600', marginBottom: '8px' }}>To Do</div>
                                <div style={{ fontSize: '24px', fontWeight: '800', color: '#6366f1', marginBottom: '6px' }}>{todoCount}</div>
                                <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '600' }}>↗ 8% from last week</div>
                            </div>
                            <div style={{ backgroundColor: t.bgPanel, padding: '20px', borderRadius: '16px', border: `1px solid ${t.border}` }}>
                                <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: '600', marginBottom: '8px' }}>In Progress</div>
                                <div style={{ fontSize: '24px', fontWeight: '800', color: '#f59e0b', marginBottom: '6px' }}>{inProgressCount}</div>
                                <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '600' }}>↗ 5% from last week</div>
                            </div>
                            <div style={{ backgroundColor: t.bgPanel, padding: '20px', borderRadius: '16px', border: `1px solid ${t.border}` }}>
                                <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '600', marginBottom: '8px' }}>Done</div>
                                <div style={{ fontSize: '24px', fontWeight: '800', color: '#10b981', marginBottom: '6px' }}>{doneCount}</div>
                                <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: '600' }}>↘ 10% from last week</div>
                            </div>
                            <div style={{ backgroundColor: t.bgPanel, padding: '20px', borderRadius: '16px', border: `1px solid ${t.border}` }}>
                                <div style={{ fontSize: '12px', color: t.textMuted, fontWeight: '600', marginBottom: '8px' }}>Employees</div>
                                <div style={{ fontSize: '24px', fontWeight: '800', color: t.textMain, marginBottom: '6px' }}>{totalEmployees}</div>
                                <div style={{ fontSize: '11px', color: t.textMuted, fontWeight: '600' }}>– No change</div>
                            </div>
                            <div style={{ backgroundColor: t.bgPanel, padding: '20px', borderRadius: '16px', border: `1px solid ${t.border}` }}>
                                <div style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '600', marginBottom: '8px' }}>Active Users</div>
                                <div style={{ fontSize: '24px', fontWeight: '800', color: '#3b82f6', marginBottom: '6px' }}>{totalEmployees}</div>
                                <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '600' }}>↗ 100% active</div>
                            </div>
                        </div>

                        {errorMsg && (
                            <div style={{ backgroundColor: '#7f1d1d', color: '#fecaca', padding: '14px 20px', borderRadius: '12px', border: '1px solid #b91c1c', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span>⚠️</span> {errorMsg}
                            </div>
                        )}

                        {/* MIDDLE ROW: CHART, CREATE FORM, ACTIVITY TIMELINE */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1.1fr', gap: '28px' }}>
                            
                            {/* Project Overview Chart */}
                            <div style={{ backgroundColor: t.bgPanel, padding: '24px', borderRadius: '20px', border: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: t.textMain }}>Project Overview</h3>
                                    <select style={{ backgroundColor: t.bgInput, color: t.textMuted, border: `1px solid ${t.border}`, borderRadius: '8px', padding: '6px 10px', fontSize: '12px', outline: 'none' }}>
                                        <option>This Week</option>
                                        <option>This Month</option>
                                    </select>
                                </div>
                                <div style={{ height: '200px', width: '100%' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <XAxis dataKey="name" stroke={t.textMuted} fontSize={11} tickLine={false} />
                                            <YAxis allowDecimals={false} stroke={t.textMuted} fontSize={11} tickLine={false} />
                                            <Tooltip contentStyle={{ backgroundColor: t.bgPanel, borderColor: t.border, borderRadius: '10px', color: t.textMain }} itemStyle={{color: t.textMain}} />
                                            <Bar dataKey="Tickets" radius={[6, 6, 0, 0]}>
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Create New Ticket Form */}
                            <div style={{ backgroundColor: t.bgPanel, padding: '24px', borderRadius: '20px', border: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: t.textMain }}>Create New Ticket</h3>
                                    <button 
                                        type="button"
                                        onClick={handleAiMagicFill}
                                        disabled={aiLoading}
                                        style={{ padding: '6px 14px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                    >
                                        <span>✨</span> {aiLoading ? 'AI Thinking...' : 'AI Powered'}
                                    </button>
                                </div>

                                <form onSubmit={handleCreateIssue} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    <div style={{ display: 'flex', gap: '14px' }}>
                                        <div style={{ flex: 2 }}>
                                            <label style={{ display: 'block', fontSize: '12px', color: t.textMuted, marginBottom: '4px', fontWeight: '600' }}>Issue Title</label>
                                            <input 
                                                type="text" 
                                                placeholder="Enter a clear and short title..." 
                                                value={title} 
                                                onChange={(e) => setTitle(e.target.value)} 
                                                required 
                                                style={{ width: '100%', padding: '10px 14px', backgroundColor: t.bgInput, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.textMain, outline: 'none', fontSize: '13px', boxSizing: 'border-box' }}
                                            />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', fontSize: '12px', color: t.textMuted, marginBottom: '4px', fontWeight: '600' }}>Assignee</label>
                                            <select 
                                                value={assignee} 
                                                onChange={(e) => setAssignee(e.target.value)}
                                                style={{ width: '100%', padding: '10px 12px', backgroundColor: t.bgInput, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.textMain, outline: 'none', fontSize: '13px', boxSizing: 'border-box' }}
                                            >
                                                <option value="">Select assignee</option>
                                                {users.map(u => <option key={u} value={u}>{u}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '14px' }}>
                                        <div style={{ flex: 2 }}>
                                            <label style={{ display: 'block', fontSize: '12px', color: t.textMuted, marginBottom: '4px', fontWeight: '600' }}>Description</label>
                                            <input 
                                                type="text" 
                                                placeholder="Describe the issue (AI can help you)..." 
                                                value={description} 
                                                onChange={(e) => setDescription(e.target.value)} 
                                                required 
                                                style={{ width: '100%', padding: '10px 14px', backgroundColor: t.bgInput, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.textMain, outline: 'none', fontSize: '13px', boxSizing: 'border-box' }}
                                            />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', fontSize: '12px', color: t.textMuted, marginBottom: '4px', fontWeight: '600' }}>Priority</label>
                                            <select 
                                                value={priority} 
                                                onChange={(e) => setPriority(e.target.value)}
                                                style={{ width: '100%', padding: '10px 12px', backgroundColor: t.bgInput, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.textMain, outline: 'none', fontSize: '13px', boxSizing: 'border-box' }}
                                            >
                                                <option value="High">🔴 High</option>
                                                <option value="Medium">🟡 Medium</option>
                                                <option value="Low">🟢 Low</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '14px', alignItems: 'flex-end' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', color: t.textMuted, marginBottom: '4px', fontWeight: '600' }}>Due Date</label>
                                            <input 
                                                type="date" 
                                                value={dueDate} 
                                                onChange={(e) => setDueDate(e.target.value)}
                                                style={{ width: '100%', padding: '9px 12px', backgroundColor: t.bgInput, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.textMain, outline: 'none', fontSize: '13px', boxSizing: 'border-box', cursor: 'pointer' }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', color: t.textMuted, marginBottom: '4px', fontWeight: '600' }}>Attach File</label>
                                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', padding: '9px 12px', backgroundColor: t.bgInput, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.textMain, fontSize: '13px', cursor: 'pointer', boxSizing: 'border-box', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                                <span>📎</span> <span style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>{attachmentName ? attachmentName : 'Choose file'}</span>
                                                <input type="file" onChange={handleFileChange} style={{ display: 'none' }} />
                                            </label>
                                        </div>

                                        <button type="submit" style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(79,70,229,0.3)', whiteSpace: 'nowrap' }}>
                                            Create Ticket
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Activity Timeline */}
                            <div style={{ backgroundColor: t.bgPanel, padding: '24px', borderRadius: '20px', border: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', maxHeight: '280px', overflowY: 'auto' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: t.textMain }}>Activity Timeline</h3>
                                    <span style={{ fontSize: '12px', color: '#6366f1', cursor: 'pointer', fontWeight: '600' }}>View All</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    {activities.map(act => (
                                        <div key={act.id} style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', borderLeft: '2px solid #6366f1', paddingLeft: '10px' }}>
                                            <span style={{ color: t.textMain, fontWeight: '500' }}>{act.text}</span>
                                            <span style={{ color: t.textMuted, fontSize: '11px', marginTop: '2px' }}>{act.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* BOTTOM ROW: KANBAN BOARD & RIGHT SIDEBAR */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2.8fr 1.1fr', gap: '28px' }}>
                            
                            {/* KANBAN BOARD */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                                {columns.map(column => {
                                    const colIssues = filteredIssues.filter(issue => issue.status === column);
                                    const accentColor = column === 'To Do' ? '#6366f1' : column === 'In Progress' ? '#f59e0b' : '#10b981';

                                    return (
                                        <div 
                                            key={column} 
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, column)}
                                            style={{ backgroundColor: t.kanbanBg, borderRadius: '20px', padding: '20px', minHeight: '480px', border: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column' }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: `1px solid ${t.border}` }}>
                                                <h3 style={{ margin: 0, color: t.textMain, fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase' }}>
                                                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: accentColor }}></span>
                                                    {column}
                                                </h3>
                                                <span style={{ backgroundColor: t.bgPanel, color: t.textMuted, fontSize: '12px', fontWeight: '700', padding: '2px 10px', borderRadius: '10px', border: `1px solid ${t.border}` }}>
                                                    {colIssues.length}
                                                </span>
                                            </div>

                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                                {colIssues.length === 0 ? (
                                                    <div style={{ textAlign: 'center', color: t.textMuted, fontSize: '13px', fontStyle: 'italic', marginTop: '60px' }}>
                                                        No tickets in {column}
                                                    </div>
                                                ) : (
                                                    colIssues.map(issue => {
                                                        const rawPriority = (issue.priority || 'Medium').toString().toLowerCase();
                                                        const isHigh = rawPriority.includes('high');
                                                        const isMed = rawPriority.includes('med');
                                                        
                                                        const priorityColor = isHigh ? t.dangerText : isMed ? t.warningText : t.successText;
                                                        const priorityBg = isHigh ? t.dangerBg : isMed ? t.warningBg : t.successBg;
                                                        const displayPriority = isHigh ? 'High' : isMed ? 'Medium' : 'Low';
                                                        const isOverdue = issue.dueDate && new Date(issue.dueDate) < new Date() && issue.status !== 'Done';

                                                        return (
                                                            <div 
                                                                key={issue.id} 
                                                                draggable
                                                                onDragStart={(e) => handleDragStart(e, issue.id)}
                                                                style={{ backgroundColor: t.ticketBg, borderLeft: `4px solid ${isOverdue ? '#ef4444' : accentColor}`, padding: '16px', borderRadius: '14px', cursor: 'grab', border: `1px solid ${t.border}`, transition: 'all 0.2s', position: 'relative' }}
                                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = t.ticketHover}
                                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = t.ticketBg}
                                                            >
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                        <span style={{ fontSize: '14px', fontWeight: '700', color: t.textMain }}>{issue.title}</span>
                                                                        <span style={{ fontSize: '10px', color: t.textMuted, fontFamily: 'monospace' }}>{issue.ticketKey || `#TCK-00${issue.id}`}</span>
                                                                    </div>
                                                                    <span style={{ fontSize: '10px', fontWeight: '700', backgroundColor: priorityBg, color: priorityColor, padding: '2px 8px', borderRadius: '6px' }}>
                                                                        {displayPriority}
                                                                    </span>
                                                                </div>

                                                                <p style={{ margin: '0 0 12px 0', color: t.textMuted, fontSize: '12px', lineHeight: '1.4' }}>{issue.description}</p>

                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: t.textMuted, marginBottom: '12px' }}>
                                                                    <span>👤 {issue.assignee || 'Unassigned'}</span>
                                                                    {issue.dueDate && (
                                                                        <span style={{ color: isOverdue ? '#ef4444' : t.textMuted }}>📅 {issue.dueDate}</span>
                                                                    )}
                                                                </div>

                                                                <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: `1px solid ${t.border}` }}>
                                                                    <button onClick={() => openComments(issue)} style={{ flex: 1, padding: '6px', backgroundColor: t.bgInput, color: '#818cf8', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>
                                                                        💬 Discuss
                                                                    </button>
                                                                    <button onClick={() => handleEditClick(issue)} style={{ flex: 1, padding: '6px', backgroundColor: t.bgInput, color: t.textMuted, border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>
                                                                        ✏️ Edit
                                                                    </button>
                                                                    {role === 'ROLE_ADMIN' && (
                                                                        <button onClick={() => handleDeleteIssue(issue.id)} style={{ flex: 1, padding: '6px', backgroundColor: t.dangerBg, color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>
                                                                            🗑️ Drop
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* RIGHT COLUMN: TOP ASSIGNEES & AI ASSISTANT */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                
                                {/* Top Assignees */}
                                <div style={{ backgroundColor: t.bgPanel, padding: '20px', borderRadius: '20px', border: `1px solid ${t.border}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: t.textMain }}>Top Assignees</h3>
                                        <select style={{ backgroundColor: t.bgInput, color: t.textMuted, border: `1px solid ${t.border}`, borderRadius: '6px', padding: '4px 8px', fontSize: '11px', outline: 'none' }}>
                                            <option>This Week</option>
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: t.textMain, marginBottom: '4px' }}>
                                                <span>{username}</span>
                                                <span style={{ color: t.textMuted }}>{totalTickets} tickets</span>
                                            </div>
                                            <div style={{ width: '100%', height: '6px', backgroundColor: t.bgInput, borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ width: '70%', height: '100%', backgroundColor: '#6366f1', borderRadius: '3px' }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: t.textMain, marginBottom: '4px' }}>
                                                <span>Ravi</span>
                                                <span style={{ color: t.textMuted }}>3 tickets</span>
                                            </div>
                                            <div style={{ width: '100%', height: '6px', backgroundColor: t.bgInput, borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ width: '30%', height: '100%', backgroundColor: '#f59e0b', borderRadius: '3px' }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: t.textMain, marginBottom: '4px' }}>
                                                <span>Unassigned</span>
                                                <span style={{ color: t.textMuted }}>2 tickets</span>
                                            </div>
                                            <div style={{ width: '100%', height: '6px', backgroundColor: t.bgInput, borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ width: '20%', height: '100%', backgroundColor: '#10b981', borderRadius: '3px' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* AI Assistant Widget */}
                                <div style={{ backgroundColor: t.bgPanel, padding: '20px', borderRadius: '20px', border: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: t.textMain }}>✨ AI Assistant</h3>
                                        <span style={{ fontSize: '10px', backgroundColor: 'rgba(99,102,241,0.2)', color: '#818cf8', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold' }}>BETA</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '12px', color: t.textMuted, lineHeight: '1.4' }}>Need help writing a ticket description or troubleshooting?</p>
                                    <button 
                                        onClick={handleAiMagicFill}
                                        style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '12px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}
                                    >
                                        ✨ Generate with AI
                                    </button>
                                </div>

                            </div>

                        </div>

                    </div>
                )}

                {/* Conditional Rendering for Other Tabs */}
                {activeTab === 'All Tickets' && renderTicketTable(filteredIssues, 'All System Tickets')}
                {activeTab === 'My Tickets' && renderTicketTable(myTickets, 'My Tickets')}
                {activeTab === 'Assigned To Me' && renderTicketTable(assignedToMeTickets, 'Assigned To Me')}
                {activeTab === 'Users' && renderUsersDirectory()}
                {['Reports', 'Calendar', 'Teams', 'Projects', 'Activity', 'Settings', 'Profile'].includes(activeTab) && renderComingSoon(activeTab)}

            </main>

            {/* EDIT MODAL */}
            {editingIssue && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: t.modalBg, backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: t.bgPanel, padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '440px', border: `1px solid ${t.border}` }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '800', color: t.textMain }}>Edit Ticket</h3>
                        <form onSubmit={handleUpdateIssue} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: t.textMuted, fontWeight: '600' }}>Title</label>
                                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required style={{ width: '100%', padding: '10px 14px', backgroundColor: t.bgInput, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.textMain, outline: 'none', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: t.textMuted, fontWeight: '600' }}>Description</label>
                                <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} required rows="3" style={{ width: '100%', padding: '10px 14px', backgroundColor: t.bgInput, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.textMain, outline: 'none', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: t.textMuted, fontWeight: '600' }}>Priority</label>
                                    <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)} style={{ width: '100%', padding: '10px 12px', backgroundColor: t.bgInput, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.textMain, outline: 'none' }}>
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: t.textMuted, fontWeight: '600' }}>Due Date</label>
                                    <input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} style={{ width: '100%', padding: '9px 12px', backgroundColor: t.bgInput, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.textMain, outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: t.textMuted, fontWeight: '600' }}>Status</label>
                                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} style={{ width: '100%', padding: '10px 12px', backgroundColor: t.bgInput, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.textMain, outline: 'none' }}>
                                    <option value="To Do">To Do</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Done">Done</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button type="submit" style={{ flex: 1, padding: '12px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>Save</button>
                                <button type="button" onClick={() => setEditingIssue(null)} style={{ flex: 1, padding: '12px', backgroundColor: t.bgInput, color: t.textMuted, border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* COMMENTS MODAL */}
            {selectedIssueForComments && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: t.modalBg, backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: t.bgPanel, padding: '24px', borderRadius: '20px', width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', height: '560px', border: `1px solid ${t.border}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${t.border}`, paddingBottom: '14px', marginBottom: '14px' }}>
                            <h3 style={{ margin: 0, color: t.textMain, fontSize: '16px', fontWeight: '700' }}>Discuss: {selectedIssueForComments.title}</h3>
                            <button onClick={() => setSelectedIssueForComments(null)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: t.textMuted }}>✕</button>
                        </div>
                        
                        <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: t.bgInput, borderRadius: '12px', border: `1px solid ${t.border}` }}>
                            {comments.length === 0 ? (
                                <p style={{ textAlign: 'center', color: t.textMuted, fontStyle: 'italic', marginTop: '120px', fontSize: '13px' }}>No comments yet. Start the conversation!</p>
                            ) : (
                                comments.map(comment => (
                                    <div key={comment.id} style={{ 
                                        alignSelf: comment.author === username ? 'flex-end' : 'flex-start',
                                        backgroundColor: comment.author === username ? '#4f46e5' : t.bgPanel,
                                        padding: '10px 14px', borderRadius: '12px', maxWidth: '80%', color: comment.author === username ? '#fff' : t.textMain, fontSize: '13px',
                                        border: comment.author !== username ? `1px solid ${t.border}` : 'none'
                                    }}>
                                        <div style={{ fontSize: '10px', fontWeight: 'bold', opacity: 0.8, marginBottom: '4px' }}>{comment.author}</div>
                                        <div>{comment.text}</div>
                                    </div>
                                ))
                            )}
                        </div>

                        <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                            <input 
                                type="text" 
                                value={newComment} 
                                onChange={(e) => setNewComment(e.target.value)} 
                                placeholder="Type a message..." 
                                style={{ flex: 1, padding: '12px 16px', backgroundColor: t.bgInput, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.textMain, outline: 'none', fontSize: '13px' }}
                                required
                            />
                            <button type="submit" style={{ padding: '12px 20px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}