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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type IssueWithRepo = IssueSummary & { repo: string };

type Props = {
  issues: IssueWithRepo[];
  org: string;
};

export default function IssuesTable({ issues, org }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Calculate pagination
  const totalPages = Math.ceil(issues.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentIssues = useMemo(() => 
    issues.slice(startIndex, endIndex), 
    [issues, startIndex, endIndex]
  );

  // Generate random bounty amount based on issue type and priority
  const generateBounty = (issue: IssueWithRepo) => {
    // Use issue ID as seed for consistent random values
    const seed = issue.id % 1000;
    const random = (seed * 9301 + 49297) % 233280 / 233280; // Simple seeded random
    
    const taskType = getTaskType(issue.labels);
    const isHighPriority = issue.labels.some(l => 
      l.name.toLowerCase().includes('high') || 
      l.name.toLowerCase().includes('urgent')
    );
    
    let baseAmount;
    // Set base amounts based on task type
    if (taskType.type === 'Bug') baseAmount = 0.05;
    else if (taskType.type === 'Feature') baseAmount = 0.15;
    else if (taskType.type === 'Documentation') baseAmount = 0.02;
    else baseAmount = 0.08;
    
    // Increase for high priority
    if (isHighPriority) baseAmount *= 1.5;
    
    // Add random variation (±50%)
    const variation = 0.5 + (random * 1.0); // 0.5 to 1.5 multiplier
    const finalAmount = baseAmount * variation;
    
    return Number(finalAmount.toFixed(3));
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
    <div className="space-y-4 ">
      {/* Table */}
      <div className="rounded-md border border-border dark:border-gray-800 bg-card px-2 md:px-2 lg:px-2">
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead className="w-24">Repo</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-32">Priority</TableHead>
              <TableHead className="w-40">Labels</TableHead>
              <TableHead className="w-20">Bounty</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentIssues.map((issue) => {
              const taskType = getTaskType(issue.labels);
              return (
                <TableRow key={issue.id}>
                  <TableCell className="w-16">
                    <div className="text-xs font-medium">#{issue.number}</div>
                  </TableCell>
                  <TableCell className="w-24">
                    <div className="text-xs font-medium truncate" title={issue.repo}>{issue.repo}</div>
                  </TableCell>
                  <TableCell className="overflow-hidden">
                    <a 
                      href={issue.htmlUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm hover:underline block truncate text-foreground hover:text-primary"
                      title={issue.title}
                    >
                      {issue.title}
                    </a>
                    <div className="text-xs text-muted-foreground truncate">
                      by {issue.author || 'unknown'}
                    </div>
                  </TableCell>
                  <TableCell className="w-16">
                    <div className="text-xs" title={getPriorityIcon(issue.labels)?.props?.children}>
                      {issue.labels.some(l => l.name.toLowerCase().includes('high') || l.name.toLowerCase().includes('urgent')) ? (
                        <span className="text-red-400 dark:text-red-300">↑ High</span>
                      ) : issue.labels.some(l => l.name.toLowerCase().includes('low')) ? (
                        <span className="text-green-400 dark:text-green-300">↓ Low</span>
                      ) : (
                        <span className="text-yellow-400 dark:text-yellow-300">→ Medium</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="w-32">
                    <div className="flex flex-wrap gap-0.5">
                      {issue.labels.slice(0, 2).map((label) => {
                        const labelColor = label.color ? `#${label.color}` : '#6b7280';
                        // Calculate if we need light or dark text based on background
                        const isLightColor = label.color ? parseInt(label.color, 16) > 0x888888 : false;
                        const textColor = isLightColor ? '#000000' : '#ffffff';
                        
                        return (
                          <Badge 
                            key={`${label.id}-${label.name}`}
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0.5 border-0 whitespace-nowrap"
                            style={{
                              backgroundColor: labelColor,
                              color: textColor,
                            }}
                            title={label.name}
                          >
                            {label.name}
                          </Badge>
                        );
                      })}
                      {issue.labels.length > 2 && (
                        <span className="text-[10px] text-muted-foreground">+{issue.labels.length - 2}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="w-20">
                    <div className="flex flex-col items-center">
                      <div className="text-xs font-medium text-green-400">
                        {generateBounty(issue)} ETH
                      </div>
                      <Badge 
                        variant={taskType.variant as any} 
                        className="text-[8px] px-1 py-0 h-3 mt-0.5"
                        title={taskType.type}
                      >
                        {taskType.type === 'Documentation' ? 'Doc' : taskType.type === 'Feature' ? 'Feat' : taskType.type}
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {issues.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No issues found.
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, issues.length)} of {issues.length} issues
          </div>
          
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                    className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(pageNum);
                        }}
                        isActive={currentPage === pageNum}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                    }}
                    className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  );
}