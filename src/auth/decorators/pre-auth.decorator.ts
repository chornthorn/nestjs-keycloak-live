import { SetMetadata } from '@nestjs/common';

type KeycloakResource = 'category' | 'product';
type KeycloakScope = 'read' | 'reads' | 'create' | 'update' | 'delete';

export const PreAuthKey = 'pre-auth';

export const PreAuth = (data: {
  resource?: KeycloakResource;
  scope?: KeycloakScope;
}) => SetMetadata(PreAuthKey, data);
