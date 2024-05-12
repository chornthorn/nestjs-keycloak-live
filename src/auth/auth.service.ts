import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { catchError, map } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const headers = {
      'Content-type': 'application/x-www-form-urlencoded',
    };
    const payload = {
      client_id: this.configService.get('KEYCLOAK_CLIENT_ID'),
      client_secret: this.configService.get('KEYCLOAK_CLIENT_SECRET'),
      scope: this.configService.get('KEYCLOAK_SCOPE'),
      grant_type: 'password',
      username: loginDto.username,
      password: loginDto.password,
    };

    const keycloakRealm = this.configService.get('KEYCLOAK_REALM_NAME');

    const response = this.httpService
      .post(`/realms/${keycloakRealm}/protocol/openid-connect/token`, payload, {
        headers,
      })
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          console.log(error);
          throw error;
        }),
      );

    if (!response) {
      throw new BadRequestException('Invalid credentials');
    }

    return response;
  }
}
