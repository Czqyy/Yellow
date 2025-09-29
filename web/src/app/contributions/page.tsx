'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface Contribution {
  id: string;
  projectId: string;
  channelId: string;
  contributor: string;
  type: string;
  title: string;
  description: string;
  amount: string;
  status: string;
  githubUrl: string;
  createdAt: string;
  project: {
    name: string;
    repository: string;
  };
}

export default function ContributionsPage() {
  const { address, isConnected } = useAccount();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'paid'>('all');

  useEffect(() => {
    if (isConnected && address) {
      fetchContributions();
    }
  }, [isConnected, address]);

  const fetchContributions = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/contributions/contributor/${address}`);
      const data = await response.json();
      setContributions(data);
    } catch (error) {
      console.error('Failed to fetch contributions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContributions = contributions.filter(contribution => {
    if (filter === 'all') return true;
    return contribution.status.toLowerCase() === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'bug_fix':
        return 'bg-red-100 text-red-800';
      case 'feature':
        return 'bg-green-100 text-green-800';
      case 'documentation':
        return 'bg-blue-100 text-blue-800';
      case 'test':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Connect your wallet to view your contributions and earnings.
          </p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contributions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                My Contributions
              </h1>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8">
          <div className="flex space-x-4">
            {[
              { key: 'all', label: 'All' },
              { key: 'pending', label: 'Pending' },
              { key: 'approved', label: 'Approved' },
              { key: 'paid', label: 'Paid' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Contributions List */}
        <div className="space-y-4">
          {filteredContributions.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No contributions found
              </h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? "You haven't made any contributions yet."
                  : `No contributions with status "${filter}".`
                }
              </p>
            </div>
          ) : (
            filteredContributions.map((contribution) => (
              <div key={contribution.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {contribution.title}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      {contribution.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Project: {contribution.project.name}</span>
                      <span>•</span>
                      <span>{new Date(contribution.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className="text-lg font-bold text-gray-900">
                      {contribution.amount} ETH
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contribution.status)}`}>
                      {contribution.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(contribution.type)}`}>
                      {contribution.type.replace('_', ' ')}
                    </span>
                    {contribution.githubUrl && (
                      <a
                        href={contribution.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View on GitHub →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

