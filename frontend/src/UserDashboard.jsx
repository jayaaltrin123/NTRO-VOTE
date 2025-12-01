import React, { useEffect, useState } from 'react';
import api from './api';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
    const [activeElections, setActiveElections] = useState([]);
    const [closedElections, setClosedElections] = useState([]);

    useEffect(() => {
        fetchElections();
    }, []);

    const fetchElections = async () => {
        try {
            const allRes = await api.get('/elections/admin/all');
            const all = allRes.data;
            setActiveElections(all.filter(e => e.status === 'ONGOING'));
            setClosedElections(all.filter(e => e.status === 'CLOSED'));
        } catch (error) {
            console.error("Failed to fetch elections");
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Elections</h1>

            {/* Active Elections */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-green-700">Active Elections</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeElections.map(election => (
                        <div key={election.id} className="bg-white p-6 rounded shadow hover:shadow-lg transition border-2 border-green-200">
                            <h3 className="text-xl font-bold mb-2">{election.title}</h3>
                            <p className="text-gray-600 mb-4">{election.description}</p>
                            <Link
                                to={`/vote/${election.id}`}
                                className="block text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                            >
                                View & Vote
                            </Link>
                        </div>
                    ))}
                    {activeElections.length === 0 && <p>No active elections at the moment.</p>}
                </div>
            </div>

            {/* Closed Elections with Results */}
            {closedElections.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold mb-4 text-red-700">Completed Elections</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {closedElections.map(election => (
                            <div key={election.id} className="bg-white p-6 rounded shadow border-2 border-red-200">
                                <h3 className="text-xl font-bold mb-2">{election.title}</h3>
                                <p className="text-gray-600 mb-4">{election.description}</p>
                                {election.winnerId ? (
                                    <div className="bg-green-50 p-4 rounded border border-green-300">
                                        <p className="text-sm text-gray-700 mb-1">Winner:</p>
                                        <p className="text-lg font-bold text-green-800">
                                            {election.nominees.find(n => n.id === election.winnerId)?.name || 'Unknown'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-gray-100 p-4 rounded">
                                        <p className="text-sm text-gray-600">Closed - No results yet</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
