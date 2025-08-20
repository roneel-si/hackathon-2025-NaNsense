declare module '@fastify/autoload' {
  import { FastifyPluginAsync } from 'fastify';
  
  const autoload: FastifyPluginAsync<{
    dir: string;
    options?: Record<string, any>;
  }>;
  
  export default autoload;
}
