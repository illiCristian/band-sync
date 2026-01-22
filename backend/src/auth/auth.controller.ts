
import { Controller, Post, Body, UnauthorizedException, HttpCode, HttpStatus, Get, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    // Stricter rate limiting for login: 5 attempts per minute
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() signInDto: Record<string, any>) {
        const user = await this.authService.validateUser(signInDto.username, signInDto.password);
        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }
        return this.authService.login(user);
    }

    // Endpoint to verify JWT token validity
    @UseGuards(JwtAuthGuard)
    @Get('verify')
    async verify() {
        return { valid: true };
    }
}
