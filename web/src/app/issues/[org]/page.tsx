import { getOpenIssuesByRepo } from '@/../github/github';
import IssuesTable from '../../../components/IssuesTable';

type Props = {
  params: { org: string };
};

// Server component with dynamic org routing
export default async function OrgIssuesPage({ params }: Props) {
  const { org } = params;
  const token = process.env.GITHUB_TOKEN; // server-side only

  // Fetch issues grouped by repo (public only, with PAT for rate limits)
  const issuesByRepo = await getOpenIssuesByRepo(org, {
    token,
    includeArchivedRepos: false,
    bodyPreviewChars: 240,
  });

  // Flatten to single array for table display
  const allIssues = Object.entries(issuesByRepo).flatMap(([repo, issues]) =>
    issues.map(issue => ({ ...issue, repo }))
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4">
        <div className="space-y-6">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
            <p className="text-muted-foreground">
              Here's a list of issues for {org} organization.
            </p>
          </div>
          
          <IssuesTable issues={allIssues} org={org} />
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: Props) {
  return {
    title: `${params.org} Issues`,
    description: `Open issues for ${params.org} organization`,
  };
}