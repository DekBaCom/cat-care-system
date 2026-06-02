import { Hono } from 'hono';
import { v4 as uuidv4 } from 'uuid';
import type { Env } from '../types';
import { authMiddleware, getUserId } from '../middleware/auth';
import { CatService } from '../services/catService';
import { execute } from '../utils/db';
import { ApiError, errorToResponse } from '../utils/errors';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024;

export const uploadRoutes = new Hono<{ Bindings: Env }>();

uploadRoutes.post('/cats/:catId/photo', authMiddleware, async (c) => {
  try {
    const userId = getUserId(c);
    const catId = c.req.param('catId');
    await CatService.getCatById(catId, userId, c.env);

    const body = await c.req.parseBody();
    const file = body['photo'];

    if (!file || typeof file === 'string' || !(file instanceof File)) {
      throw new ApiError(400, 'กรุณาเลือกไฟล์รูปภาพ', 'NO_FILE');
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new ApiError(400, 'รองรับเฉพาะ JPEG, PNG, WebP, GIF', 'INVALID_TYPE');
    }
    if (file.size > MAX_SIZE) {
      throw new ApiError(400, 'ไฟล์ต้องไม่เกิน 5MB', 'FILE_TOO_LARGE');
    }

    const ext = file.type.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
    const key = `cats/${catId}/${uuidv4()}.${ext}`;

    await c.env.IMAGES.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
    });

    const photoUrl = `/photos/${key}`;
    await execute(c.env.DB, 'UPDATE cats SET photo_url = ?, updated_at = ? WHERE id = ?', [photoUrl, new Date().toISOString(), catId]);

    return c.json({ success: true, data: { photoUrl } });
  } catch (error) {
    const { statusCode, body } = errorToResponse(error as Error);
    return c.json(body, statusCode as 400 | 401 | 404 | 500);
  }
});

uploadRoutes.delete('/cats/:catId/photo', authMiddleware, async (c) => {
  try {
    const userId = getUserId(c);
    const catId = c.req.param('catId');
    const cat = await CatService.getCatById(catId, userId, c.env);
    if (cat.photoUrl?.startsWith('/photos/')) {
      const key = cat.photoUrl.slice('/photos/'.length);
      await c.env.IMAGES.delete(key);
    }
    await execute(c.env.DB, 'UPDATE cats SET photo_url = NULL, updated_at = ? WHERE id = ?', [new Date().toISOString(), catId]);
    return c.json({ success: true, message: 'ลบรูปสำเร็จ' });
  } catch (error) {
    const { statusCode, body } = errorToResponse(error as Error);
    return c.json(body, statusCode as 400 | 401 | 404 | 500);
  }
});
