import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerConfig: swaggerJSDoc.OAS3Options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Review Reveal API',
      description: 'Review Reveal API documentation.',
      version: '1.0.0'
    },
    externalDocs: {
      description: 'View swagger.json',
      url: '../swagger.json'
    },
    servers: [{ url: 'http://localhost:4444' }],
    tags: [
      { name: 'auth', description: 'Authentication operations for users' },
      { name: 'games', description: 'Everything about your games' },
      { name: 'movies', description: 'Access to movies data' },
      { name: 'reviews', description: 'Acess to movie reviews' }
    ],
    components: {
      schemas: {
        SignUpRequest: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              example: 'orion.bootcamp@email.com'
            },
            password: {
              type: 'string',
              example: '12345678aA!'
            },
            confirmPassword: {
              type: 'string',
              example: '12345678aA!'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              example: 'orion.bootcamp@email.com'
            },
            password: {
              type: 'string',
              example: '12345678aA!'
            },
            rememberMe: {
              type: 'boolean',
              example: true
            }
          }
        },
        ForgotPasswordRequest: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              example: 'orion.bootcamp@email.com'
            }
          }
        },
        ResetPasswordRequest: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              example: 1
            },
            password: {
              type: 'string',
              example: '12345678aA!'
            },
            confirmPassword: {
              type: 'string',
              example: '12345678aA!'
            },
            token: {
              type: 'string',
              example: '9537dc28fde56be7af87cb4967ca05f292ea94d551d31d0fba92cb58d8a3586d'
            }
          }
        },
        SendAnswerRequest: {
          type: 'object',
          properties: {
            reviewId: {
              type: 'string',
              example: '5424a49ec3a3681eca002c23'
            },
            answer: {
              type: 'string',
              example: 'Pirates of the Caribbean: The Curse of the Black Pearl'
            }
          }
        },
        ConfirmEmailRequest: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              example: 1
            },
            token: {
              type: 'string',
              example: '9537dc28fde56be7af87cb4967ca05f292ea94d551d31d0fba92cb58d8a3586d'
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean'
            },
            message: {
              type: 'string'
            }
          }
        },
        ApiResponseData: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean'
            },
            message: {
              type: 'string'
            },
            data: {
              type: 'object',
              properties: {}
            }
          }
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['src/controller/*.ts', 'controller/*.js']
};
