import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { catchError, firstValueFrom, map } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { raw } from 'express';
import { PreAuthKey } from '../decorators/pre-auth.decorator';

@Injectable()
export class KeycloakAuthzGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext) {
    // check if isPublic is true
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    // get authorization header
    const authorization = request.headers.authorization;
    if (!authorization) {
      return false;
    }

    const [type, token] = authorization.split(' ');

    if (type.toLowerCase() !== 'bearer') {
      return false;
    }

    // get resource and scope from metadata
    // check if resource defined first (at class level) and scope defined second (at method level)
    const getResource: { resource: string } = this.reflector.getAllAndOverride<{
      resource: string;
    }>(PreAuthKey, [context.getClass()]);

    const getScope: { scope: string } = this.reflector.getAllAndOverride<{
      scope: string;
    }>(PreAuthKey, [context.getHandler()]);

    // check if both resource and scope are defined at method level
    const resourceAndScope: { resource: string; scope: string } =
      this.reflector.getAllAndOverride<{ resource: string; scope: string }>(
        PreAuthKey,
        [context.getHandler(), context.getClass()],
      );

    // condition
    if (getResource && getScope) {
      resourceAndScope.resource = getResource.resource;
      resourceAndScope.scope = getScope.scope;
    }

    if (!resourceAndScope) {
      throw new ForbiddenException(
        'You are not authorized to access this resource',
      );
    }

    // keycloak template: resource#scope
    // example: report#create
    const permission = `${resourceAndScope.resource}#${resourceAndScope.scope}`;

    // call external service to make decision

    const requestBody = {
      grant_type: 'urn:ietf:params:oauth:grant-type:uma-ticket',
      audience: this.configService.get('KEYCLOAK_CLIENT_ID'),
      permission: permission,
      response_mode: 'decision', // for keycloak to return response as boolean [true|false]
    };

    const baseUrl = this.configService.get('KEYCLOAK_URL');
    const realm = this.configService.get('KEYCLOAK_REALM_NAME');

    return await firstValueFrom(
      this.httpService
        .post(
          `${baseUrl}/realms/${realm}/protocol/openid-connect/token`,
          requestBody,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        )
        .pipe(
          map((response) => {
            return response.data;
          }),
          catchError((error) => {
            throw new ForbiddenException(
              'You are not authorized to access this resource',
            );
          }),
        ),
    );
  }
}
