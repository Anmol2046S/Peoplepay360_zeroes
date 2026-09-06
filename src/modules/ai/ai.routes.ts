import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth';
import { AiService } from './aiService';

const aiChatSchema = z.object({
  message: z.string().min(1).max(2000),
  conversationId: z.string().optional(),
});

export default async function aiRoutes(app: FastifyInstance) {
  const aiService = new AiService();

  app.post('/chat', { preHandler: [requireAuth] }, async (request, reply) => {
    const parsed = aiChatSchema.parse(request.body ?? {});
    const user = request.user!;
    const result = await aiService.chat(user, parsed);
    return reply.send({ success: true, data: result });
  });
}
