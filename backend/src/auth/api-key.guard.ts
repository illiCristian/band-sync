
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const apiKey = request.headers['x-api-key'];
        const validApiKey = process.env.ADMIN_API_KEY;

        // Allow read-only (GET) requests without key for now (public catalog)
        // Adjust logic if catalog should be private too.
        if (request.method === 'GET') {
            return true;
        }

        if (!validApiKey) {
            // If no key configured on server, fail open/warn or fail closed? 
            // Fail closed is safer.
            console.error("ADMIN_API_KEY not configured in backend environment");
            return false;
        }

        if (apiKey !== validApiKey) {
            throw new UnauthorizedException('Invalid API Key');
        }

        return true;
    }
}
