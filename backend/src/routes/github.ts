import express from 'express';
import { prisma } from '../index';
import crypto from 'crypto';

const router = express.Router();

// GitHub webhook handler
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-hub-signature-256'] as string;
    const payload = JSON.stringify(req.body);
    
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET || '')
      .update(payload)
      .digest('hex');
    
    const providedSignature = signature?.replace('sha256=', '');
    
    if (expectedSignature !== providedSignature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    const event = req.headers['x-github-event'] as string;
    
    // Handle different GitHub events
    switch (event) {
      case 'pull_request':
        await handlePullRequest(req.body);
        break;
      case 'issues':
        await handleIssue(req.body);
        break;
      case 'push':
        await handlePush(req.body);
        break;
      default:
        console.log(`Unhandled GitHub event: ${event}`);
    }
    
    res.status(200).json({ message: 'Webhook processed' });
  } catch (error) {
    console.error('GitHub webhook error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// Handle pull request events
async function handlePullRequest(payload: any) {
  const { action, pull_request, repository } = payload;
  
  if (action === 'opened' || action === 'closed') {
    // Find project by repository
    const project = await prisma.project.findFirst({
      where: { repository: repository.html_url }
    });
    
    if (!project) return;
    
    // Create or update contribution
    const contribution = await prisma.contribution.upsert({
      where: {
        githubUrl: pull_request.html_url
      },
      update: {
        status: action === 'closed' && pull_request.merged ? 'APPROVED' : 'PENDING'
      },
      create: {
        projectId: project.id,
        channelId: '', // Will be set when channel is created
        contributor: pull_request.user.login, // GitHub username, not Ethereum address
        type: 'FEATURE',
        title: pull_request.title,
        description: pull_request.body,
        amount: BigInt(0), // Will be set by pricing logic
        status: 'PENDING',
        githubUrl: pull_request.html_url
      }
    });
    
    console.log(`Processed PR ${pull_request.number} for project ${project.name}`);
  }
}

// Handle issue events
async function handleIssue(payload: any) {
  const { action, issue, repository } = payload;
  
  if (action === 'opened' || action === 'closed') {
    // Find project by repository
    const project = await prisma.project.findFirst({
      where: { repository: repository.html_url }
    });
    
    if (!project) return;
    
    // Create contribution for bug fix
    const contribution = await prisma.contribution.upsert({
      where: {
        githubUrl: issue.html_url
      },
      update: {
        status: action === 'closed' ? 'APPROVED' : 'PENDING'
      },
      create: {
        projectId: project.id,
        channelId: '', // Will be set when channel is created
        contributor: issue.user.login, // GitHub username
        type: 'BUG_FIX',
        title: issue.title,
        description: issue.body,
        amount: BigInt(0), // Will be set by pricing logic
        status: 'PENDING',
        githubUrl: issue.html_url
      }
    });
    
    console.log(`Processed issue ${issue.number} for project ${project.name}`);
  }
}

// Handle push events
async function handlePush(payload: any) {
  const { commits, repository } = payload;
  
  // Find project by repository
  const project = await prisma.project.findFirst({
    where: { repository: repository.html_url }
  });
  
  if (!project) return;
  
  // Process commits for potential contributions
  for (const commit of commits) {
    // Simple heuristic: if commit message contains keywords, it might be a contribution
    const message = commit.message.toLowerCase();
    const isContribution = message.includes('fix') || 
                          message.includes('feature') || 
                          message.includes('docs') ||
                          message.includes('test');
    
    if (isContribution) {
      const contribution = await prisma.contribution.create({
        data: {
          projectId: project.id,
          channelId: '', // Will be set when channel is created
          contributor: commit.author.username, // GitHub username
          type: 'OTHER',
          title: commit.message.split('\n')[0], // First line of commit message
          description: commit.message,
          amount: BigInt(0), // Will be set by pricing logic
          status: 'PENDING',
          githubUrl: commit.url
        }
      });
      
      console.log(`Processed commit ${commit.id} for project ${project.name}`);
    }
  }
}

export default router;

