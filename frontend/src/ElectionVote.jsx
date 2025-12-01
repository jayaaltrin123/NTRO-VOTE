import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from './api';

const ElectionVote = () => {
    const { id } = useParams();
    const [election, setElection] = useState(null);
    const [selectedNominee, setSelectedNominee] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [voteSuccess, setVoteSuccess] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchElection = async () => {
            try {
                const res = await api.get(`/elections/${id}`);
                setElection(res.data);
            } catch (error) {
                console.error("Failed to fetch election");
            }
        };
        fetchElection();
    }, [id]);

    const handleVoteClick = () => {
        if (!selectedNominee) return;
        setShowConfirm(true);
    };

    const confirmVote = async () => {
        try {
            await api.post('/vote', {
                electionId: parseInt(id),
                nomineeId: selectedNominee.id
            });
            setShowConfirm(false);
            setVoteSuccess(true);
            setTimeout(() => navigate('/'), 2000);
        } catch (error) {
            setShowConfirm(false);
            setError(error.response?.data?.error || 'Failed to vote');
            setTimeout(() => setError(''), 3000);
        }
    };

    if (!election) return <div>Loading...</div>;

    return (
        <div className="p-8 relative">
            <h1 className="text-3xl font-bold mb-2">{election.title}</h1>
            <p className="text-gray-600 mb-8">{election.description}</p>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {voteSuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    Vote cast successfully! Redirecting...
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {election.nominees.map(nominee => (
                    <div
                        key={nominee.id}
                        className={`border-2 p-4 rounded cursor-pointer transition ${selectedNominee?.id === nominee.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                            }`}
                        onClick={() => setSelectedNominee(nominee)}
                    >
                        <img
                            src={`http://localhost:8080${nominee.imageUrl}`}
                            alt={nominee.name}
                            className="w-full h-48 object-cover rounded mb-4"
                        />
                        <h3 className="text-xl font-bold">{nominee.name}</h3>
                        <p className="text-gray-600">{nominee.details}</p>
                    </div>
                ))}
            </div>

            <div className="text-center">
                <button
                    onClick={handleVoteClick}
                    disabled={!selectedNominee || voteSuccess}
                    className={`px-8 py-3 rounded text-lg font-bold text-white ${selectedNominee && !voteSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
                        }`}
                >
                    Cast Vote
                </button>
            </div>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                        <h3 className="text-xl font-bold mb-4">Confirm Vote</h3>
                        <p className="mb-6">Are you sure you want to vote for <span className="font-bold">{selectedNominee?.name}</span>?</p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmVote}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ElectionVote;
