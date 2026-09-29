import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { corsMiddleware } from './server/middlewares/corsHandler.ts';
import { errorHandler } from './server/middlewares/errorHandler.ts';
import clientesRoutes from './server/routes/clientesRoutes.ts';
import tecnicosRoutes from './server/routes/tecnicosRoutes.ts';
import osRoutes from './server/routes/osRoutes.ts';
import dashboardRoutes from './server/routes/dashboardRoutes.ts';
import estoqueRoutes from './server/routes/estoqueRoutes.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Middlewares essenciais
  app.use(corsMiddleware);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logging simples de requisições API
  app.use('/api', (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[API] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });
    next();
  });

  // Rotas RESTful do Sistema de Ordens de Serviço
  app.use('/api/clientes', clientesRoutes);
  app.use('/api/tecnicos', tecnicosRoutes);
  app.use('/api/ordens-servico', osRoutes);
  app.use('/api/os', osRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/estoque', estoqueRoutes);

  // Endpoint de status / healthcheck
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'online',
      service: 'OS Master REST API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      schemaPrisma: 'mysql',
      environment: isProd ? 'production' : 'development'
    });
  });

  // Integração com Vite (SPA Front-End)
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  // Middleware global de tratamento de erros
  app.use(errorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 [OS Master] Servidor Express ativo em http://localhost:${PORT}`);
    console.log(`📦 [OS Master] Endpoints REST disponíveis em http://localhost:${PORT}/api`);
  });
}

startServer().catch((err) => {
  console.error('Falha ao inicializar o servidor OS Master:', err);
  process.exit(1);
});
