'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';

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

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const { address } = useAccount();
  const [isContributing, setIsContributing] = useState(false);

  const isOwner = address?.toLowerCase() === project.owner.toLowerCase();
  const totalContributions = project.contributions.length;
  const totalChannels = project.channels.length;

  const handleContribute = async () => {
    setIsContributing(true);
    try {
      // TODO: Implement contribution flow
      console.log('Starting contribution flow for project:', project.id);
    } catch (error) {
      console.error('Failed to start contribution:', error);
    } finally {
      setIsContributing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {project.name}
          </h3>
          <p className="text-gray-600 text-sm mb-2">
            {project.description}
          </p>
        </div>
        {isOwner && (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            Your Project
          </span>
        )}
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
        <span>{totalContributions} contributions</span>
        <span>{totalChannels} active channels</span>
      </div>

      <div className="flex space-x-3">
        {!isOwner && (
          <button
            onClick={handleContribute}
            disabled={isContributing}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isContributing ? 'Starting...' : 'Contribute'}
          </button>
        )}
        
        <button className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          View Details
        </button>
      </div>
    </div>
  );
}

