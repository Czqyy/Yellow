"use client";

import { useState, useMemo } from "react";
import type { IssueSummary } from "@/../github/github";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type IssueWithRepo = IssueSummary & { repo: string };

type Props = {
  issues: IssueWithRepo[];
  org: string;
};

export default function IssuesTable({ issues, org }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Get unique labels for priority simulation
  const priorityLabels = useMemo(() => {
    const priorities = new Set<string>();
    issues.forEach(issue => {
      issue.labels.forEach(label => {
        if (label.name.toLowerCase().includes('priority') || 
            label.name.toLowerCase().includes('urgent') ||
            label.name.toLowerCase().includes('high') ||
            label.name.toLowerCase().includes('low') ||
            label.name.toLowerCase().includes('medium')) {
          priorities.add(label.name);
        }
      });
    });
    return Array.from(priorities);
  }, [issues]);

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const matchesSearch = searchQuery === "" || 
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.bodyPreview?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.repo.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || issue.state === statusFilter;
      
      const matchesPriority = priorityFilter === "all" || 
        issue.labels.some(label => label.name === priorityFilter);

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [issues, searchQuery, statusFilter, priorityFilter]);

  const getStatusIcon = (state: string) => {
    switch (state) {
      case "open":
        return <div className="h-2 w-2 rounded-full bg-yellow-500" />;
      case "closed":
        return <div className="h-2 w-2 rounded-full bg-green-500" />;
      default:
        return <div className="h-2 w-2 rounded-full bg-gray-500" />;
    }
  };

  const getPriorityIcon = (labels: IssueSummary['labels']) => {
    const priorityLabel = labels.find(l => 
      l.name.toLowerCase().includes('high') || 
      l.name.toLowerCase().includes('urgent')
    );
    const mediumLabel = labels.find(l => l.name.toLowerCase().includes('medium'));
    const lowLabel = labels.find(l => l.name.toLowerCase().includes('low'));

    if (priorityLabel) {
      return <span className="text-red-500">↑ High</span>;
    } else if (mediumLabel) {
      return <span className="text-yellow-500">→ Medium</span>;
    } else if (lowLabel) {
      return <span className="text-green-500">↓ Low</span>;
    } else {
      return <span className="text-gray-500">→ Medium</span>;
    }
  };

  const getTaskType = (labels: IssueSummary['labels']) => {
    const bugLabel = labels.find(l => l.name.toLowerCase().includes('bug'));
    const featureLabel = labels.find(l => l.name.toLowerCase().includes('feature') || l.name.toLowerCase().includes('enhancement'));
    const docLabel = labels.find(l => l.name.toLowerCase().includes('doc'));

    if (bugLabel) return { type: "Bug", variant: "destructive" };
    if (featureLabel) return { type: "Feature", variant: "default" };
    if (docLabel) return { type: "Documentation", variant: "secondary" };
    return { type: "Task", variant: "outline" };
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Filter tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Priority</SelectItem>
              {priorityLabels.map(label => (
                <SelectItem key={label} value={label}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline">
            View
          </Button>
          
          <Button>
            Add Task
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox />
              </TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIssues.map((issue) => {
              const taskType = getTaskType(issue.labels);
              return (
                <TableRow key={issue.id}>
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">TASK-{issue.number}</div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant={taskType.variant as any}>
                          {taskType.type}
                        </Badge>
                        <a 
                          href={issue.htmlUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium text-sm hover:underline"
                        >
                          {issue.title}
                        </a>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {issue.repo} • by {issue.author || 'unknown'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(issue.state)}
                      <span className="text-sm capitalize">{issue.state}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1 text-sm">
                      {getPriorityIcon(issue.labels)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="1"/>
                        <circle cx="19" cy="12" r="1"/>
                        <circle cx="5" cy="12" r="1"/>
                      </svg>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {filteredIssues.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No issues found matching your filters.
        </div>
      )}
    </div>
  );
}