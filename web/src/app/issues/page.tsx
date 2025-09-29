import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Featured organizations with their info
const featuredOrgs = [
  {
    name: 'modelcontextprotocol',
    displayName: 'Model Context Protocol',
    description: 'A standard for connecting AI assistants to data sources',
    totalRepos: 8,
    openIssues: 24,
    avgReward: 0.085,
    category: 'AI/ML',
    logo: '🤖'
  },
  {
    name: 'microsoft',
    displayName: 'Microsoft',
    description: 'Technology corporation developing software, hardware, and services',
    totalRepos: 150,
    openIssues: 450,
    avgReward: 0.12,
    category: 'Enterprise',
    logo: '🏢'
  },
  {
    name: 'vercel',
    displayName: 'Vercel',
    description: 'Platform for frontend frameworks and static sites',
    totalRepos: 45,
    openIssues: 89,
    avgReward: 0.095,
    category: 'Developer Tools',
    logo: '▲'
  },
  {
    name: 'facebook',
    displayName: 'Meta (Facebook)',
    description: 'Social technology company building the metaverse',
    totalRepos: 120,
    openIssues: 320,
    avgReward: 0.15,
    category: 'Social Media',
    logo: '👥'
  },
  {
    name: 'google',
    displayName: 'Google',
    description: 'Multinational technology company specializing in Internet services',
    totalRepos: 200,
    openIssues: 580,
    avgReward: 0.18,
    category: 'Technology',
    logo: '🔍'
  },
  {
    name: 'ethereum',
    displayName: 'Ethereum Foundation',
    description: 'Decentralized platform for smart contracts and DApps',
    totalRepos: 35,
    openIssues: 78,
    avgReward: 0.25,
    category: 'Blockchain',
    logo: '⟠'
  }
];

export default function IssuesIndexPage() {
  return (
    <div className="min-h-screen bg-background dark:bg-gray-950">
      <div className="container mx-auto py-6 px-4">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Open Source Bounties
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover organizations offering cryptocurrency rewards for contributing to their open source projects
            </p>
            <div className="flex justify-center gap-4 text-sm text-muted-foreground">
              <span>💰 Earn ETH for contributions</span>
              <span>🚀 Support open source</span>
              <span>🌟 Build your reputation</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredOrgs.map((org) => (
              <Link key={org.name} href={`/issues/${org.name}`}>
                <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer h-full">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{org.logo}</div>
                        <div>
                          <CardTitle className="text-lg">{org.displayName}</CardTitle>
                          <p className="text-sm text-muted-foreground">@{org.name}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {org.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {org.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium text-foreground">{org.openIssues}</div>
                        <div className="text-muted-foreground">Open Issues</div>
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{org.totalRepos}</div>
                        <div className="text-muted-foreground">Repositories</div>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Avg. Reward</span>
                        <span className="text-lg font-bold text-green-400">
                          {org.avgReward.toFixed(3)} ETH
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        ≈ ${(org.avgReward * 2500).toFixed(0)} USD
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center space-y-4 pt-8">
            <h2 className="text-2xl font-semibold text-foreground">How it works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="space-y-2">
                <div className="text-3xl">1️⃣</div>
                <h3 className="font-semibold">Browse Issues</h3>
                <p className="text-sm text-muted-foreground">
                  Explore open issues from top organizations and their bounty rewards
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl">2️⃣</div>
                <h3 className="font-semibold">Contribute Code</h3>
                <p className="text-sm text-muted-foreground">
                  Submit pull requests to solve issues and help improve the projects
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl">3️⃣</div>
                <h3 className="font-semibold">Earn Rewards</h3>
                <p className="text-sm text-muted-foreground">
                  Get paid in ETH when your contributions are merged and accepted
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
