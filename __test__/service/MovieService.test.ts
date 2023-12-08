import { Container } from 'typedi';
import { MovieDTO } from '../../src/dto';
import { Game, Movie, Review, User } from '../../src/entity';
import { EntityNotFoundException, GameIsActiveException } from '../../src/exception';
import {} from '../../src/interface';
import { GameRepository, GameReviewRepository, MovieRepository, ReviewRepository, UserRepository } from '../../src/repository';
import { MovieService } from '../../src/service';
import { Generate } from '../mocks/Generate';

const movieService = Container.get(MovieService);
const movieRepository = Container.get(MovieRepository);
const userRepository = Container.get(UserRepository);
const gameRepository = Container.get(GameRepository);
const gameReviewRepository = Container.get(GameReviewRepository);

const generate = new Generate();

describe('MovieService', () => {
  describe('searchMoviesByTitle', () => {
    it('should return a array with the movies', async () => {
      const game: Game = generate.gameData();
      const user: User = generate.userData();
      const title = 'Pira';
      const expectedMovies: Movie[] = [
        {
          title: 'Pirates of the Caribbean: The Curse of the Black Pearl',
          posterPath: '/z8onk7LV9Mmw6zKz4hT6pzzvmvl.jpg',
          releaseDate: new Date('2003-07-09'),
          id: 22,
          reviews: [],
          imdbId: '1234'
        },
        {
          title: 'Pirates of the Caribbean: Dead Men Tell No Tales',
          posterPath: '/qwoGfcg6YUS55nUweKGujHE54Wy.jpg',
          releaseDate: new Date('2017-05-23'),
          id: 166426,
          reviews: [],
          imdbId: '5678'
        }
      ];

      const spyGetById = jest.spyOn(userRepository, 'getById').mockResolvedValue(user);
      const spyGameByUser = jest.spyOn(gameRepository, 'getActiveGameByUser').mockResolvedValue(game);
      const spyGetByTitle = jest.spyOn(movieRepository, 'getByTitle').mockResolvedValue(expectedMovies);

      const result: MovieDTO[] = await movieService.searchMoviesByTitle(user.id, title);

      // expect(result).toEqual(generate.reviewResponse());
      expect(spyGetById).toHaveBeenCalledWith(user.id);
      expect(spyGameByUser).toHaveBeenCalledWith(user);
    });

    it('should throw EntityNotFoundException if the user was not found', async () => {
      const user: User = generate.userData();
      const title = 'Pira';

      const spyGetById = jest.spyOn(userRepository, 'getById').mockResolvedValue(null);

      await expect(movieService.searchMoviesByTitle(user.id, title)).rejects.toThrow(EntityNotFoundException);
      expect(spyGetById).toHaveBeenCalledWith(user.id);
    });

    it('should throw EntityNotFoundException if the user does not have an active game', async () => {
      const user: User = generate.userData();
      const title = 'Pira';

      const spyGetById = jest.spyOn(userRepository, 'getById').mockResolvedValue(user);
      const spyGameByUser = jest.spyOn(gameRepository, 'getActiveGameByUser').mockResolvedValue(null);

      await expect(movieService.searchMoviesByTitle(user.id, title)).rejects.toThrow(EntityNotFoundException);
      expect(spyGetById).toHaveBeenCalledWith(user.id);
      expect(spyGameByUser).toHaveBeenCalledWith(user);
    });

    it('should throw EntityNotFoundException if the user does not have a movie with the title', async () => {
      const user: User = generate.userData();
      const game: Game = generate.gameData();
      const title = 'Pira';

      const spyGetById = jest.spyOn(userRepository, 'getById').mockResolvedValue(user);
      const spyGameByUser = jest.spyOn(gameRepository, 'getActiveGameByUser').mockResolvedValue(game);
      const spyGetByTitle = jest.spyOn(movieRepository, 'getByTitle').mockResolvedValue([]);

      await expect(movieService.searchMoviesByTitle(user.id, title)).rejects.toThrow(EntityNotFoundException);
      expect(spyGetById).toHaveBeenCalledWith(user.id);
      expect(spyGameByUser).toHaveBeenCalledWith(user);
      expect(spyGetByTitle).toHaveBeenCalledWith(title);
    });
  });
});
