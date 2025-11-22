import { Router, Request, Response } from 'express';

const router = Router();

// POST /api/v1/deploy
router.post('/', (req: Request, res: Response) => {
  const instanceId = `inst_${Math.random().toString(36).substring(2, 11)}`;
  
  const response = {
    instance_id: instanceId,
    deploy_url: `https://mrnewton.example.com/instances/${instanceId}`,
    expires_in_seconds: 2592000
  };

  res.status(201).json(response);
});

export default router;
