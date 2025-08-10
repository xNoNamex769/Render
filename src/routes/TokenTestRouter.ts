// src/routes/TokenTestRouter.ts
import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

router.get('/generate-token/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  const secret = process.env.JWT_SECRET;
  if (!secret) {
     res.status(500).json({ error: 'JWT_SECRET no configurado en el entorno' });
     return;
  }

  const token = jwt.sign({ IdUsuario: parseInt(id) }, secret, { expiresIn: '30d' });

  res.json({
    token,
    instrucciones: 'Copia este token y úsalo en Authorization como: Bearer <token>',
  });
});

export default router;
