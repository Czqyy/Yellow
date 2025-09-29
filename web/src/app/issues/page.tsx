import { getOpenIssuesByRepo } from '../../../github/github';

// Server component: fetch at request time. Set GITHUB_TOKEN in env for higher rate limit / private access (if needed).
export default async function IssuesPage() {
  const token = process.env.GITHUB_TOKEN; // optional
  const org = 'modelcontextprotocol';

  // Fetch issues grouped by repo
  const issuesByRepo = await getOpenIssuesByRepo(org, {
    token,
    includePrivateRepos: false,
    includeArchivedRepos: false,
    bodyPreviewChars: 240,
  });

  const repoNames = Object.keys(issuesByRepo).sort((a, b) => a.localeCompare(b));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Issues for {org}</h1>
            <a
              className="text-blue-600 hover:text-blue-800"
              href={`https://github.com/${org}`}
              target="_blank"
              rel="noreferrer"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {repoNames.length === 0 ? (
          <div className="text-center py-12 text-gray-600">No repositories found.</div>
        ) : (
          <div className="space-y-10">
            {repoNames.map((repo) => {
              const issues = issuesByRepo[repo] || [];
              return (
                <section key={repo}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-semibold text-gray-900">{repo}</h2>
                    <span className="text-sm text-gray-500">{issues.length} open issue{issues.length === 1 ? '' : 's'}</span>
                  </div>
                  {issues.length === 0 ? (
                    <div className="rounded-md border bg-white p-4 text-gray-600">No open issues.</div>
                  ) : (
                    <ul className="space-y-3">
                      {issues.map((it) => (
                        <li key={it.id} className="rounded-md border bg-white p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <a
                                href={it.htmlUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-base font-medium text-blue-700 hover:underline"
                              >
                                #{it.number} {it.title}
                              </a>
                              {it.author && (
                                <div className="mt-1 text-sm text-gray-500">by {it.author}</div>
                              )}
                              {it.bodyPreview && (
                                <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                                  {it.bodyPreview}
                                  {it.body && it.body.length > (it.bodyPreview?.length || 0) ? '…' : ''}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2 justify-end">
                              {it.labels.map((lb) => (
                                <span
                                  key={`${lb.id}-${lb.name}`}
                                  className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs"
                                  style={{
                                    backgroundColor: lb.color ? `#${lb.color}20` : undefined,
                                    borderColor: lb.color ? `#${lb.color}55` : undefined,
                                    color: lb.color ? `#${lb.color}` : undefined,
                                  }}
                                  title={lb.description || ''}
                                >
                                  {lb.name}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            Created {new Date(it.createdAt).toLocaleString()} · Updated {new Date(it.updatedAt).toLocaleString()}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
