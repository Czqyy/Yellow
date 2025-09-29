export type IssueLabel = {
	id: number;
	name: string;
	color?: string;
	description?: string | null;
};

export type IssueSummary = {
	id: number;
	number: number;
	title: string;
	htmlUrl: string;
	state: "open" | "closed";
	createdAt: string; // ISO string
	updatedAt: string; // ISO string
	author?: string | null;
	labels: IssueLabel[];
	body?: string | null;
	bodyPreview?: string | null; // first ~280 chars for quick previews
};

export type RepoIssuesMap = Record<string, IssueSummary[]>; // key: repo name

type GitHubUser = {
	login: string;
	type: "User" | "Organization" | string;
};

type GitHubRepo = {
	id: number;
	name: string;
	full_name: string;
	private: boolean;
	archived?: boolean;
};

type GitHubIssue = {
	id: number;
	number: number;
	title: string;
	html_url: string;
	state: "open" | "closed";
	created_at: string;
	updated_at: string;
	user?: { login?: string | null } | null;
	labels: Array<
		| { id: number; name: string; color?: string; description?: string | null }
		| string
	>;
	body?: string | null;
	pull_request?: unknown; // present when item is a PR, not an issue
};

export type GetOpenIssuesOptions = {
	includeArchivedRepos?: boolean;
	includePrivateRepos?: boolean; // requires a token with proper scopes
	token?: string; // Optional token to raise rate limits / access private repos (server-side only)
	perPage?: number; // for pagination, default 100 (max for GitHub API)
	bodyPreviewChars?: number; // default 280
};

const GITHUB_API = "https://api.github.com";
const DEFAULT_PER_PAGE = 100;

function buildHeaders(token?: string): HeadersInit {
	const headers: HeadersInit = {
		Accept: "application/vnd.github+json",
		"X-GitHub-Api-Version": "2022-11-28",
	};
	if (token) headers["Authorization"] = `Bearer ${token}`;
	return headers;
}

function parseRateLimit(errResp: Response): Error {
	const remaining = errResp.headers.get("X-RateLimit-Remaining");
	const reset = errResp.headers.get("X-RateLimit-Reset");
	const resetDate = reset ? new Date(parseInt(reset, 10) * 1000) : undefined;
	const hint =
		remaining === "0"
			? `GitHub rate limit exceeded. Resets ${resetDate ? `at ${resetDate.toISOString()}` : "soon"}. Add a token or try later.`
			: `GitHub API error ${errResp.status}.`;
	const e = new Error(hint);
	// Attach status for programmatic handling
	// @ts-expect-error augmenting error
	e.status = errResp.status;
	return e;
}

async function getJsonOrThrow<T>(url: string, headers: HeadersInit): Promise<T> {
	const res = await fetch(url, { headers, cache: "no-store" });
	if (!res.ok) throw parseRateLimit(res);
	return (await res.json()) as T;
}

function getNextLink(linkHeader: string | null): string | null {
	if (!linkHeader) return null;
	const parts = linkHeader.split(",");
	for (const p of parts) {
		const m = p.match(/<([^>]+)>;\s*rel="(\w+)"/);
		if (m && m[2] === "next") return m[1];
	}
	return null;
}

async function getAllPages<T>(initialUrl: string, headers: HeadersInit): Promise<T[]> {
	const out: T[] = [];
	let url: string | null = initialUrl;
	while (url) {
		const res = await fetch(url, { headers, cache: "no-store" });
		if (!res.ok) throw parseRateLimit(res);
		const page = (await res.json()) as T[];
		out.push(...page);
		url = getNextLink(res.headers.get("link"));
	}
	return out;
}

async function resolveAccountType(account: string, headers: HeadersInit): Promise<GitHubUser> {
	const url = `${GITHUB_API}/users/${encodeURIComponent(account)}`;
	return await getJsonOrThrow<GitHubUser>(url, headers);
}

async function listReposForAccount(
	account: string,
	isOrg: boolean,
	headers: HeadersInit,
	perPage = DEFAULT_PER_PAGE
): Promise<GitHubRepo[]> {
	const base = isOrg ? `${GITHUB_API}/orgs/${account}` : `${GITHUB_API}/users/${account}`;
	const url = `${base}/repos?per_page=${perPage}&sort=updated`;
	return await getAllPages<GitHubRepo>(url, headers);
}

async function listOpenIssues(owner: string, repo: string, headers: HeadersInit, perPage = DEFAULT_PER_PAGE): Promise<GitHubIssue[]> {
	const url = `${GITHUB_API}/repos/${owner}/${repo}/issues?state=open&per_page=${perPage}`;
	const items = await getAllPages<GitHubIssue>(url, headers);
	// Filter out pull requests (they include a `pull_request` field in the issues API)
	return items.filter((it) => !Object.prototype.hasOwnProperty.call(it, "pull_request"));
}

function toIssueSummary(issue: GitHubIssue, bodyPreviewChars = 280): IssueSummary {
	const labels: IssueLabel[] = (issue.labels || [])
		.map((l) =>
			typeof l === "string"
				? { id: -1, name: l }
				: { id: l.id, name: l.name, color: l.color, description: l.description }
		);
	const body = issue.body ?? null;
	const bodyPreview = body ? body.slice(0, bodyPreviewChars) : null;
	return {
		id: issue.id,
		number: issue.number,
		title: issue.title,
		htmlUrl: issue.html_url,
		state: issue.state,
		createdAt: issue.created_at,
		updatedAt: issue.updated_at,
		author: issue.user?.login ?? null,
		labels,
		body,
		bodyPreview,
	};
}

/**
 * Given a GitHub account (user or organization), returns a mapping from repo name to a list of open issue summaries.
 * - Includes issue title, labels, and a short preview of the body.
 * - Skips pull requests that appear in the /issues API.
 *
 * Notes
 * - Without a token, GitHub rate limits are very low (60 requests/hr). Provide `options.token` on the server to increase limits.
 * - Set `includePrivateRepos: true` only when using a token with appropriate scopes.
 */
export async function getOpenIssuesByRepo(
	account: string,
	options: GetOpenIssuesOptions = {}
): Promise<RepoIssuesMap> {
	const {
		includeArchivedRepos = false,
		includePrivateRepos = false,
		token,
		perPage = DEFAULT_PER_PAGE,
		bodyPreviewChars = 280,
	} = options;

	if (!account || !account.trim()) throw new Error("account is required");

	const headers = buildHeaders(token);
	const user = await resolveAccountType(account, headers);
	const isOrg = user.type === "Organization";

	const repos = await listReposForAccount(account, isOrg, headers, perPage);
	const filtered = repos.filter((r) =>
		(includePrivateRepos || !r.private) && (includeArchivedRepos || !r.archived)
	);

	const result: RepoIssuesMap = {};

	// Limit concurrency to avoid rate spikes. Basic simple pool of size 5.
	const poolSize = 5;
	let idx = 0;
	const owner = account; // owner equals account for listing issues under each repo

	async function worker() {
		while (true) {
			const i = idx++;
			if (i >= filtered.length) break;
			const repo = filtered[i];
			try {
				const issues = await listOpenIssues(owner, repo.name, headers, perPage);
				result[repo.name] = issues.map((it) => toIssueSummary(it, bodyPreviewChars));
			} catch (e) {
				// Fail soft per-repo: attach an empty list on error so callers can still use partial data
				result[repo.name] = [];
				// Optionally, you can add logging here
			}
		}
	}

	const workers = Array.from({ length: Math.min(poolSize, filtered.length) }, () => worker());
	await Promise.all(workers);

    // console.log(result)

	return result;
}

// Small convenience: default export object for ergonomic imports
export default {
	getOpenIssuesByRepo,
};

