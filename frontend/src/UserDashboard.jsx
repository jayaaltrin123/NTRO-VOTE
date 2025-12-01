import React, { useEffect, useState } from 'react';
import api from './api';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
    const [elections, setElections] = useState([]);

    useEffect(() => {
        const fetchElections = async () => {
            try {
                const res = await api.get('/elections/active');
                setElections(res.data);
            } catch (error) {
                console.error("Failed to fetch elections");
            }
        };
        fetchElections();
    }, []);

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Active Elections</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {elections.map(election => (
                    <div key={election.id} className="bg-white p-6 rounded shadow hover:shadow-lg transition">
                        <h2 className="text-xl font-bold mb-2">{election.title}</h2>
                        <p className="text-gray-600 mb-4">{election.description}</p>
                        <Link
                            to={`/vote/${election.id}`}
                            className="block text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                        >
                            View & Vote
                        </Link>
                    </div>
                ))}
                {elections.length === 0 && <p>No active elections at the moment.</p>}
            </div>
        </div>
    );
};

export default UserDashboard;
