'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  description: string;
  repository: string;
  owner: string;
  token: string;
  createdAt: string;
  channels: any[];
  contributions: any[];
}

export default function ProjectsPage() {
  const { address, isConnected } = useAccount();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected && address) {
      fetchProjects();
    }
  }, [isConnected, address]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/projects');
      const data = await response.json();
      // Filter projects owned by the current user
      const userProjects = data.filter((project: Project) => 
        project.owner.toLowerCase() === address?.toLowerCase()
      );
      setProjects(userProjects);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
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
            Connect your wallet to manage your projects.
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
          <p className="mt-4 text-gray-600">Loading projects...</p>
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
                My Projects
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Browse Projects
              </Link>
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No projects yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first project to start paying contributors!
            </p>
            <Link
              href="/"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {project.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {project.description}
                  </p>
                </div>

                <div className="mb-4">
                  <a
                    href={project.repository}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Repository →
                  </a>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{project.contributions.length} contributions</span>
                  <span>{project.channels.length} active channels</span>
                </div>

                <div className="space-y-2">
                  <Link
                    href={`/projects/${project.id}`}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center block"
                  >
                    Manage Project
                  </Link>
                  <Link
                    href={`/projects/${project.id}/contributions`}
                    className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-center block"
                  >
                    View Contributions
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

