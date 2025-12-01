import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { API_BASE_URL } from './api';

const ManageElection = () => {
    const { id } = useParams();
    const [election, setElection] = useState(null);
    const [results, setResults] = useState([]);
    const [newNominee, setNewNominee] = useState({ name: '', details: '', image: null });

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchResults, 5000); // Poll results
        return () => clearInterval(interval);
    }, [id]);

    const fetchData = async () => {
        try {
            const res = await api.get(`/elections/${id}`);
            setElection(res.data);
            fetchResults();
        } catch (error) {
            console.error("Failed to fetch election");
        }
    };

    const fetchResults = async () => {
        try {
            const res = await api.get(`/elections/admin/${id}/results`);
            setResults(res.data);
        } catch (error) {
            console.error("Failed to fetch results");
        }
    };

    const handleAddNominee = async () => {
        const formData = new FormData();
        formData.append('name', newNominee.name);
        formData.append('details', newNominee.details);
        formData.append('image', newNominee.image);

        try {
            await api.post(`/elections/admin/${id}/nominees`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setNewNominee({ name: '', details: '', image: null });
            fetchData();
        } catch (error) {
            alert('Failed to add nominee');
        }
    };

    const handleDeleteNominee = async (nomineeId) => {
        if (!window.confirm("Delete this nominee?")) return;
        try {
            await api.delete(`/elections/admin/nominees/${nomineeId}`);
            fetchData();
        } catch (error) {
            alert('Failed to delete nominee');
        }
    };

    if (!election) return <div>Loading...</div>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Manage: {election.title}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Nominees Section */}
                <div>
                    <h2 className="text-2xl font-bold mb-4">Nominees</h2>
                    <div className="bg-gray-100 p-4 rounded mb-6">
                        <h3 className="font-bold mb-2">Add Nominee</h3>
                        <input
                            className="w-full p-2 mb-2 border rounded"
                            placeholder="Name"
                            value={newNominee.name}
                            onChange={e => setNewNominee({ ...newNominee, name: e.target.value })}
                        />
                        <input
                            className="w-full p-2 mb-2 border rounded"
                            placeholder="Details"
                            value={newNominee.details}
                            onChange={e => setNewNominee({ ...newNominee, details: e.target.value })}
                        />
                        <input
                            type="file"
                            className="w-full mb-2"
                            onChange={e => setNewNominee({ ...newNominee, image: e.target.files[0] })}
                        />
                        <button onClick={handleAddNominee} className="bg-blue-600 text-white px-4 py-2 rounded">
                            Add Nominee
                        </button>
                    </div>

                    <div className="space-y-4">
                        {election.nominees.map(nominee => (
                            <div key={nominee.id} className="flex items-center bg-white p-4 rounded shadow border">
                                <img
                                    src={`${API_BASE_URL}${nominee.imageUrl}`}
                                    alt={nominee.name}
                                    className="w-16 h-16 object-cover rounded mr-4"
                                />
                                <div className="flex-1">
                                    <h4 className="font-bold">{nominee.name}</h4>
                                    <p className="text-sm text-gray-600">{nominee.details}</p>
                                </div>
                                <button
                                    onClick={() => handleDeleteNominee(nominee.id)}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Results Section */}
                <div>
                    <h2 className="text-2xl font-bold mb-4">Live Results</h2>
                    <div className="bg-white p-6 rounded shadow border">
                        {results.map(result => (
                            <div key={result.nomineeId} className="mb-4">
                                <div className="flex justify-between mb-1">
                                    <span className="font-bold">{result.name}</span>
                                    <span>{result.count} votes</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-blue-600 h-2.5 rounded-full"
                                        style={{
                                            width: `${results.reduce((a, b) => a + b.count, 0) > 0
                                                ? (result.count / results.reduce((a, b) => a + b.count, 0)) * 100
                                                : 0}%`
                                        }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                        {results.length === 0 && <p>No votes yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageElection;
