import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerConfig: swaggerJSDoc.OAS3Options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Review Reveal API',
      description:
        'Review Reveal API documentation.\n\n' +
        'Some useful links:\n' +
        '- [Bellatrix - IMDB ReviewReveal (PDF, 618kB)](https://cdn.discordapp.com/attachments/1156342600626880522/1182400872861413386/Bellatrix_-_IMDb_ReviewReveal_-_Entrega.pdf?ex=65848fa0&is=65721aa0&hm=f3d102580efd4829a2bad11582297f2bea7717c0aa223988ca34bdf67c54fd90&)\n' +
        '- [API code coverage](https://reviewreveal.hopto.org/coverage)',
      version: '1.0.0'
    },
    externalDocs: {
      description: 'View swagger.json',
      url: '../swagger.json'
    },
    servers: [{ url: 'http://localhost:4444' }, { url: 'https://reviewreveal.hopto.org' }],
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
            answer: {
              type: 'number',
              example: 22
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
        MovieReviewRequest: {
          type: 'object',
          properties: {
            keyword: {
              type: 'string',
              example: process.env.MOVIE_REVIEW_KEYWORD
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
