import React, { useEffect, useState } from 'react';
import api from './api';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const [elections, setElections] = useState([]);
    const [newElection, setNewElection] = useState({ title: '', description: '', startAt: '', endAt: '' });
    const [showCreate, setShowCreate] = useState(false);

    useEffect(() => {
        fetchElections();
    }, []);

    const fetchElections = async () => {
        try {
            const res = await api.get('/elections/admin/all');
            setElections(res.data);
        } catch (error) {
            console.error("Failed to fetch elections");
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

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    {showCreate ? 'Cancel' : 'Create Election'}
                </button>
            </div>

            {showCreate && (
                <div className="bg-gray-100 p-6 rounded mb-8">
                    <h2 className="text-xl font-bold mb-4">New Election</h2>
                    <input
                        className="w-full p-2 mb-2 border rounded"
                        placeholder="Title"
                        value={newElection.title}
                        onChange={e => setNewElection({ ...newElection, title: e.target.value })}
                    />
                    <textarea
                        className="w-full p-2 mb-2 border rounded"
                        placeholder="Description"
                        value={newElection.description}
                        onChange={e => setNewElection({ ...newElection, description: e.target.value })}
                    />
                    <button onClick={handleCreate} className="bg-green-600 text-white px-4 py-2 rounded">
                        Save Election
                    </button>
                </div>
            )}

            <div className="grid gap-6">
                {elections.map(election => (
                    <div key={election.id} className="bg-white p-6 rounded shadow border">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold">{election.title}</h2>
                                <p className="text-gray-600">{election.description}</p>
                                <span className={`inline-block px-2 py-1 rounded text-sm mt-2 ${election.status === 'ONGOING' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {election.status}
                                </span>
                            </div>
                            <div className="space-x-2">
                                <button
                                    onClick={() => toggleStatus(election)}
                                    className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                                >
                                    {election.status === 'ONGOING' ? 'Close' : 'Open'}
                                </button>
                                <button
                                    onClick={() => handleReset(election.id)}
                                    className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200"
                                >
                                    Reset Votes
                                </button>
                                <Link
                                    to={`/admin/election/${election.id}`}
                                    className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200"
                                >
                                    Manage Nominees
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
