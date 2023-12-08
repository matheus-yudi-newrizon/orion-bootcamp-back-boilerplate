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
            reviewText: {
              type: 'string',
              example: `Having been deposed by his crew, "Capt. Jack Sparrow" (Johnny Depp) arrives in Port Royal with little but the clothes he stands up in. He turns up just as the governor's daughter "Elizabeth" (Keira Knightley) is having to fend off the rather unwanted matrimonial intentions of "Norrington" (Jack Davenport). She has designs on the blacksmith's apprentice - "Turner" (a handsome but insipid, sorry, Orlando Bloom) whom she rescued from a pirate raid many years earlier. "Sparrow" would prove an excellent catch for "Norrington" but thanks to an hot poker, a donkey and some legerdemain at sea, he and "Turner" are soon abroad on the trail of his old crew and of the legendary pirates who sail the seas in the "Black Pearl" seeking an odd sort of salvation! What now ensues are some pacily directed escapades with loads of attitude, swash and buckle. Some pithy dialogue and a rousing (if slightly repetitive) score from Klaus Badelt take us criss-crossing the Caribbean constantly jumping from frying pan to fire. The star for me here is certainly Geoffrey Rush. A man who rarely disappoints, and on this occasion brings a comically potent degree of menace as his "Barbossa" character ensures that the plot thickens and the story gathers momentum. It's a bit on the long side - there are a few sagging moments now and again, but a solid supporting cast led by Kevin McNally provide some borderline slapstick humour, occasionally tempered by the dignified persona of an underused Jonathan Pryce's "Gov. Swann" and an whole suite of powdered wigs. The visual effects are top drawer and the story well worth a watch on a big screen to do justice to the imagery and the best traditions of seafaring yarns.`
            },
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
