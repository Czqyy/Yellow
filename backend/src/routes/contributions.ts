import express from 'express';
import { prisma } from '../index';

const router = express.Router();

// Get all contributions
router.get('/', async (req, res) => {
  try {
    const contributions = await prisma.contribution.findMany({
      include: {
        project: true,
        channel: true
      }
    });
    res.json(contributions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contributions' });
  }
});

// Get contribution by ID
router.get('/:id', async (req, res) => {
  try {
    const contribution = await prisma.contribution.findUnique({
      where: { id: req.params.id },
      include: {
        project: true,
        channel: true
      }
    });
    
    if (!contribution) {
      return res.status(404).json({ error: 'Contribution not found' });
    }
    
    res.json(contribution);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contribution' });
  }
});

// Create new contribution
router.post('/', async (req, res) => {
  try {
    const { 
      projectId, 
      channelId, 
      contributor, 
      type, 
      title, 
      description, 
      amount, 
      githubUrl 
    } = req.body;
    
    const contribution = await prisma.contribution.create({
      data: {
        projectId,
        channelId,
        contributor,
        type,
        title,
        description,
        amount: BigInt(amount),
        status: 'PENDING',
        githubUrl
      }
    });
    
    res.status(201).json(contribution);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create contribution' });
  }
});

// Update contribution status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    const contribution = await prisma.contribution.update({
      where: { id: req.params.id },
      data: { status }
    });
    
    res.json(contribution);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update contribution status' });
  }
});

// Get contributions by project
router.get('/project/:projectId', async (req, res) => {
  try {
    const contributions = await prisma.contribution.findMany({
      where: { projectId: req.params.projectId },
      include: {
        project: true,
        channel: true
      }
    });
    
    res.json(contributions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project contributions' });
  }
});

// Get contributions by contributor
router.get('/contributor/:contributor', async (req, res) => {
  try {
    const contributions = await prisma.contribution.findMany({
      where: { contributor: req.params.contributor },
      include: {
        project: true,
        channel: true
      }
    });
    
    res.json(contributions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contributor contributions' });
  }
});

export default router;

