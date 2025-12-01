import React, { useEffect, useState } from 'react';
import api, { API_BASE_URL } from './api';
import { Link } from 'react-router-dom';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const AdminDashboard = () => {
    const [elections, setElections] = useState([]);
    const [newElection, setNewElection] = useState({ title: '', description: '', startAt: '', endAt: '' });
    const [showCreate, setShowCreate] = useState(false);

    // Voter Management
    const [voters, setVoters] = useState([]);
    const [newVoterPhone, setNewVoterPhone] = useState('');
    const [newVoterName, setNewVoterName] = useState('');
    const [showVoters, setShowVoters] = useState(false);

    // OTP Viewing
    const [otps, setOtps] = useState([]);
    const [showOtps, setShowOtps] = useState(false);

    // Statistics & Reports
    const [selectedElectionId, setSelectedElectionId] = useState(null);
    const [stats, setStats] = useState(null);
    const [results, setResults] = useState([]);
    const [showStats, setShowStats] = useState(false);
    const [showReports, setShowReports] = useState(false);

    useEffect(() => {
        fetchElections();
        if (showVoters) {
            fetchVoters();
        }
        if (showOtps) {
            fetchOtps();
            const interval = setInterval(fetchOtps, 5000);
            return () => clearInterval(interval);
        }
        if (showStats && selectedElectionId) {
            fetchStatistics();
        }
        if (showReports && selectedElectionId) {
            fetchResults();
            const interval = setInterval(fetchResults, 5000);
            return () => clearInterval(interval);
        }
    }, [showVoters, showOtps, showStats, showReports, selectedElectionId]);

    const fetchElections = async () => {
        try {
            const res = await api.get('/elections/admin/all');
            setElections(res.data);
        } catch (error) {
            console.error("Failed to fetch elections");
        }
    };

    const fetchVoters = async () => {
        try {
            const res = await api.get('/admin/users');
            setVoters(res.data);
        } catch (error) {
            console.error("Failed to fetch voters");
        }
    };

    const fetchOtps = async () => {
        try {
            const res = await api.get('/admin/otps');
            setOtps(res.data);
        } catch (error) {
            console.error("Failed to fetch OTPs");
        }
    };

    const fetchStatistics = async () => {
        try {
            const res = await api.get(`/admin/voting-stats/${selectedElectionId}`);
            setStats(res.data);
        } catch (error) {
            console.error("Failed to fetch statistics");
        }
    };

    const fetchResults = async () => {
        try {
            const res = await api.get(`/elections/admin/${selectedElectionId}/results`);
            setResults(res.data);
        } catch (error) {
            console.error("Failed to fetch results");
        }
    };

    const handleCreate = async () => {
        try {
            await api.post('/elections/admin', newElection);
            setShowCreate(false);
            fetchElections();
        } catch (error) {
            alert('Failed to create election');
        }
    };

    const handleAddVoter = async () => {
        // Validate phone number and name
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(newVoterPhone)) {
            alert('Please enter a valid 10-digit phone number');
            return;
        }
        if (!newVoterName || newVoterName.trim() === '') {
            alert('Please enter a name');
            return;
        }
        try {
            await api.post('/admin/users', { phone: newVoterPhone, name: newVoterName });
            setNewVoterPhone('');
            setNewVoterName('');
            fetchVoters();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to add voter');
        }
    };

    const handleRemoveVoter = async (phone) => {
        if (!window.confirm(`Remove ${phone} from eligible voters?`)) return;
        try {
            await api.delete(`/admin/users/${phone}`);
            fetchVoters();
        } catch (error) {
            alert('Failed to remove voter');
        }
    };

    const handleReset = async (id) => {
        if (!window.confirm("Reset votes for this election?")) return;
        try {
            await api.post(`/elections/admin/${id}/reset`);
            alert('Votes reset');
        } catch (error) {
            alert('Failed to reset');
        }
    };

    const toggleStatus = async (election) => {
        const newStatus = election.status === 'ONGOING' ? 'CLOSED' : 'ONGOING';
        try {
            await api.put(`/elections/admin/${election.id}/status`, { status: newStatus });
            fetchElections();
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const handleFinalizeElection = async (id) => {
        if (!window.confirm("Finalize this election? This will determine the winner and close the election.")) return;
        try {
            const res = await api.post(`/elections/admin/${id}/finalize`);
            alert(res.data.message);
            fetchElections();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to finalize election');
        }
    };

    const handleDeleteElection = async (id) => {
        if (!window.confirm("Delete this election permanently? This action cannot be undone.")) return;
        try {
            await api.delete(`/elections/admin/${id}`);
            alert('Election deleted successfully');
            fetchElections();
        } catch (error) {
            alert('Failed to delete election');
        }
    };

    const totalVotes = results.reduce((sum, r) => sum + r.count, 0);
    const pieData = results.map(r => ({
        name: r.name,
        value: r.count,
        percentage: totalVotes > 0 ? ((r.count / totalVotes) * 100).toFixed(1) : 0
    }));

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <div className="space-x-2">
                    <button onClick={() => setShowCreate(!showCreate)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        {showCreate ? 'Cancel' : 'Create Election'}
                    </button>
                    <button onClick={() => { setShowVoters(!showVoters); if (!showVoters) fetchVoters(); }} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                        {showVoters ? 'Hide' : 'Manage'} Voters
                    </button>
                    <button onClick={() => { setShowOtps(!showOtps); if (!showOtps) fetchOtps(); }} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                        {showOtps ? 'Hide' : 'View'} OTPs
                    </button>
                    <button onClick={() => setShowStats(!showStats)} className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
                        {showStats ? 'Hide' : 'View'} Statistics
                    </button>
                    <button onClick={() => setShowReports(!showReports)} className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700">
                        {showReports ? 'Hide' : 'View'} Reports
                    </button>
                </div>
            </div>

            {showCreate && (
                <div className="bg-gray-100 p-6 rounded mb-8">
                    <h2 className="text-xl font-bold mb-4">New Election</h2>
                    <input className="w-full p-2 mb-2 border rounded" placeholder="Title" value={newElection.title} onChange={e => setNewElection({ ...newElection, title: e.target.value })} />
                    <textarea className="w-full p-2 mb-2 border rounded" placeholder="Description" value={newElection.description} onChange={e => setNewElection({ ...newElection, description: e.target.value })} />
                    <button onClick={handleCreate} className="bg-green-600 text-white px-4 py-2 rounded">Save Election</button>
                </div>
            )}

            {showVoters && (
                <div className="bg-purple-50 p-6 rounded mb-8 border border-purple-200">
                    <h2 className="text-xl font-bold mb-4">Manage Eligible Voters</h2>
                    <div className="flex flex-col md:flex-row gap-2 mb-4">
                        <input className="flex-1 p-2 border rounded" placeholder="Name" value={newVoterName} onChange={e => setNewVoterName(e.target.value)} />
                        <input className="flex-1 p-2 border rounded" placeholder="Phone Number" value={newVoterPhone} onChange={e => setNewVoterPhone(e.target.value)} />
                        <button onClick={handleAddVoter} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">Add Voter</button>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {voters
                            .filter(voter => voter.phoneNumber && voter.phoneNumber.trim() !== '')
                            .map(voter => (
                                <div key={voter.id} className="flex justify-between items-center bg-white p-3 rounded border">
                                    <div>
                                        <span className="font-bold">{voter.name || 'N/A'}</span>
                                        <span className="text-gray-600 ml-2">({voter.phoneNumber})</span>
                                    </div>
                                    <button onClick={() => handleRemoveVoter(voter.phoneNumber)} className="text-red-600 hover:text-red-800 text-sm">Remove</button>
                                </div>
                            ))}
                        {voters.filter(v => v.phoneNumber && v.phoneNumber.trim() !== '').length === 0 && <p className="text-gray-500">No eligible voters yet.</p>}
                    </div>
                </div>
            )}

            {showOtps && (
                <div className="bg-green-50 p-6 rounded mb-8 border border-green-200">
                    <h2 className="text-xl font-bold mb-4">Active OTPs</h2>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {otps.map(otp => (
                            <div key={otp.phone} className="flex justify-between items-center bg-white p-3 rounded border">
                                <span className="font-mono">{otp.phone}</span>
                                <span className="font-bold text-green-700 text-lg">{otp.code}</span>
                                <span className="text-sm text-gray-500">Expires: {new Date(otp.expiresAt).toLocaleTimeString()}</span>
                            </div>
                        ))}
                        {otps.length === 0 && <p className="text-gray-500">No active OTPs.</p>}
                    </div>
                </div>
            )}

            {showStats && (
                <div className="bg-orange-50 p-6 rounded mb-8 border border-orange-200">
                    <h2 className="text-xl font-bold mb-4">Voting Statistics</h2>
                    <select className="w-full p-2 mb-4 border rounded" value={selectedElectionId || ''} onChange={e => setSelectedElectionId(e.target.value)}>
                        <option value="">Select Election</option>
                        {elections.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                    </select>
                    {stats && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded shadow">
                                    <h3 className="font-bold mb-2">Summary</h3>
                                    <p>Total Eligible: {stats.voted.filter(v => v.phone && v.phone.trim() !== '').length + stats.notVoted.filter(v => v.phone && v.phone.trim() !== '').length}</p>
                                    <p>Total Voted: {stats.voted.filter(v => v.phone && v.phone.trim() !== '').length}</p>
                                    <p>Not Voted: {stats.notVoted.filter(v => v.phone && v.phone.trim() !== '').length}</p>
                                </div>
                                <div className="bg-white p-4 rounded shadow">
                                    <h3 className="font-bold mb-2 text-green-700">Voted ({stats.voted.filter(v => v.phone && v.phone.trim() !== '').length})</h3>
                                    <div className="max-h-40 overflow-y-auto space-y-1">
                                        {stats.voted
                                            .filter(v => v.phone && v.phone.trim() !== '')
                                            .map((v, i) => <p key={i} className="text-sm">{v.name || v.phone} {v.name ? `(${v.phone})` : ''}</p>)}
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded shadow col-span-2">
                                    <h3 className="font-bold mb-2 text-red-700">Not Voted ({stats.notVoted.filter(v => v.phone && v.phone.trim() !== '').length})</h3>
                                    <div className="max-h-40 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-2">
                                        {stats.notVoted
                                            .filter(v => v.phone && v.phone.trim() !== '')
                                            .map((v, i) => <p key={i} className="text-sm">{v.name || v.phone} {v.name ? `(${v.phone})` : ''}</p>)}
                                    </div>
                                </div>
                            </div>

                            {/* Leading Nominees Section */}
                            {results.length > 0 && (
                                <div className="bg-white p-6 rounded shadow">
                                    <h3 className="font-bold mb-4 text-purple-700 text-lg">Leading Nominees</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {results
                                            .sort((a, b) => b.count - a.count)
                                            .map((nominee, index) => (
                                                <div key={nominee.nomineeId} className={`p-4 rounded border-2 ${index === 0 ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`}>
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={`${API_BASE_URL}${nominee.imageUrl}`}
                                                            alt={nominee.name}
                                                            className="w-16 h-16 object-cover rounded-full border-2 border-gray-300"
                                                        />
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                {index === 0 && <span className="text-2xl">🏆</span>}
                                                                <p className="font-bold">{nominee.name}</p>
                                                            </div>
                                                            <p className="text-2xl font-bold text-blue-600">{nominee.count} votes</p>
                                                            {results.reduce((sum, r) => sum + r.count, 0) > 0 && (
                                                                <p className="text-sm text-gray-600">
                                                                    {((nominee.count / results.reduce((sum, r) => sum + r.count, 0)) * 100).toFixed(1)}%
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {showReports && (
                <div className="bg-pink-50 p-6 rounded mb-8 border border-pink-200">
                    <h2 className="text-xl font-bold mb-4">Election Reports</h2>
                    <select className="w-full p-2 mb-4 border rounded" value={selectedElectionId || ''} onChange={e => setSelectedElectionId(e.target.value)}>
                        <option value="">Select Election</option>
                        {elections.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                    </select>
                    {results.length > 0 && (
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white p-4 rounded shadow">
                                <h3 className="font-bold mb-4 text-center">Vote Count by Nominee</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={results}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="count" fill="#8884d8" name="Votes" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="bg-white p-4 rounded shadow">
                                <h3 className="font-bold mb-4 text-center">Vote Percentage Distribution</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={entry => `${entry.percentage}%`}>
                                            {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="grid gap-6">
                {elections.map(election => (
                    <div key={election.id} className="bg-white p-6 rounded shadow border">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold">{election.title}</h2>
                                <p className="text-gray-600">{election.description}</p>
                                <span className={`inline-block px-2 py-1 rounded text-sm mt-2 ${election.status === 'ONGOING' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{election.status}</span>
                                {election.winnerId && (
                                    <div className="mt-2 text-sm text-green-700 font-bold">
                                        Winner: {election.nominees.find(n => n.id === election.winnerId)?.name || 'N/A'}
                                    </div>
                                )}
                            </div>
                            <div className="space-x-2">
                                <button onClick={() => toggleStatus(election)} className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">{election.status === 'ONGOING' ? 'Close' : 'Open'}</button>
                                {election.status === 'ONGOING' && (
                                    <button onClick={() => handleFinalizeElection(election.id)} className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200">Finalize Result</button>
                                )}
                                <button onClick={() => handleReset(election.id)} className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200">Reset Votes</button>
                                <Link to={`/admin/election/${election.id}`} className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200">Manage Nominees</Link>
                                <button onClick={() => handleDeleteElection(election.id)} className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200">Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
