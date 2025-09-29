import { redirect } from 'next/navigation';

// Redirect base /issues to modelcontextprotocol as default
export default function IssuesIndexPage() {
  redirect('/issues/modelcontextprotocol');
}
