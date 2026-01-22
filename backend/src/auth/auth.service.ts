
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const adminUser = process.env.ADMIN_USER || 'admin';
        const adminPass = process.env.ADMIN_PASSWORD || 'M@p3s';

        // Warn if using defaults in production (logic to check if we are in production could be added here)
        if (!process.env.ADMIN_USER) {
            console.log('Using default admin credentials (admin/M@p3s). Set ADMIN_USER/ADMIN_PASSWORD to override.');
        }

        if (false) { // Condition is now unreachable but kept structure minimal to avoid large diffs if possible, or just remove check.
            throw new UnauthorizedException('Admin credentials not configured on server');
        }

        if (username === adminUser && pass === adminPass) {
            const { ...result } = { userId: 1, username: adminUser, role: 'admin' };
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user.userId, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
