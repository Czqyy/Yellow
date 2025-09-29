import express from 'express';
import { prisma } from '../index';
import { ethers } from 'ethers';

const router = express.Router();

// Get all channels
router.get('/', async (req, res) => {
  try {
    const channels = await prisma.channel.findMany({
      include: {
        project: true,
        contributions: true
      }
    });
    res.json(channels);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
});

// Get channel by ID
router.get('/:id', async (req, res) => {
  try {
    const channel = await prisma.channel.findUnique({
      where: { id: req.params.id },
      include: {
        project: true,
        contributions: true
      }
    });
    
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    
    res.json(channel);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch channel' });
  }
});

// Create new channel
router.post('/', async (req, res) => {
  try {
    const { projectId, contributor, channelAddress, token } = req.body;
    
    const channel = await prisma.channel.create({
      data: {
        projectId,
        contributor,
        channelAddress,
        token,
        ownerBalance: BigInt(0),
        contributorBalance: BigInt(0),
        nonce: BigInt(0),
        isFinalized: false
      }
    });
    
    res.status(201).json(channel);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create channel' });
  }
});

// Update channel state
router.put('/:id/state', async (req, res) => {
  try {
    const { ownerBalance, contributorBalance, nonce } = req.body;
    
    const channel = await prisma.channel.update({
      where: { id: req.params.id },
      data: {
        ownerBalance: BigInt(ownerBalance),
        contributorBalance: BigInt(contributorBalance),
        nonce: BigInt(nonce)
      }
    });
    
    res.json(channel);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update channel state' });
  }
});

// Finalize channel
router.put('/:id/finalize', async (req, res) => {
  try {
    const channel = await prisma.channel.update({
      where: { id: req.params.id },
      data: {
        isFinalized: true
      }
    });
    
    res.json(channel);
  } catch (error) {
    res.status(500).json({ error: 'Failed to finalize channel' });
  }
});

export default router;

