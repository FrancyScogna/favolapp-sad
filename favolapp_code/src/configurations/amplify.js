export const config = {
  Auth: {
    Default: {
      authenticationFlowType: 'CUSTOM_AUTH',
    },
    Cognito: {
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
      userPoolId: import.meta.env.VITE_USER_POOL_ID,
      identityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID,
    },
  },
  API: {
    GraphQL: {
      endpoint: import.meta.env.VITE_GRAPHQL_ENDPOINT,
      region: import.meta.env.VITE_AWS_REGION,
      defaultAuthMode: 'userPool',
    },
  },
  Storage: {
    S3: {
      bucket: import.meta.env.VITE_S3_BUCKET_NAME,
      region: import.meta.env.VITE_AWS_REGION,
    },
  },
};
