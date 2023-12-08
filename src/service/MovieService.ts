import { Service } from 'typedi';
import { MovieDTO } from '../dto';
import { Game, Movie, User } from '../entity';
import { EntityNotFoundException } from '../exception';
import { GameRepository, MovieRepository, UserRepository } from '../repository';

@Service()
export class MovieService {
  constructor(
    private readonly movieRepository: MovieRepository,
    private readonly gameRepository: GameRepository,
    private readonly userRepository: UserRepository
  ) {}

  /**
   * Search movies by title.
   *
   * @param userId - The id of the user.
   * @param title - The title of the movie.
   *
   * @returns A promise that resolves with the filtered movies.
   * @throws {EntityNotFoundException} if the user, game or movie was not found in database.
   * @throws {DatabaseOperationFailException} if there is a database operation failure.
   */
  public async searchMoviesByTitle(userId: number, title: string): Promise<MovieDTO[]> {
    const user: User = await this.userRepository.getById(userId);
    if (!user) throw new EntityNotFoundException('user');

    const game: Game = await this.gameRepository.getActiveGameByUser(user);
    if (!game) throw new EntityNotFoundException('game');

    const filteredMovies: Movie[] = await this.movieRepository.getByTitle(title);
    if (filteredMovies.length === 0) throw new EntityNotFoundException('movie');

    const movies: MovieDTO[] = filteredMovies.map(movie => new MovieDTO(movie));
    return movies;
  }

  /**
   * Retrieves a movie based on a given review text.
   *
   * @param userId - The id of the user.
   * @param reviewText - The text of the review associated with the movie.
   *
   * @returns A promise that resolves with the movie.
   * @throws {EntityNotFoundException} if the user, game or movie was not found in database.
   * @throws {DatabaseOperationFailException} if the database operation fails.
   */
  public async getMovieByReview(userId: number, reviewText: string): Promise<MovieDTO> {
    const user: User = await this.userRepository.getById(userId);
    if (!user) throw new EntityNotFoundException('user');

    const game: Game = await this.gameRepository.getActiveGameByUser(user);
    if (!game) throw new EntityNotFoundException('game');

    const movie: Movie = await this.movieRepository.getMovieByReview(reviewText);
    if (!movie) throw new EntityNotFoundException('movie');

    return new MovieDTO(movie);
  }
}
