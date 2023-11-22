import { Service } from 'typedi';
import { MovieDTO } from '../dto/MovieDTO';
import { Game } from '../entity/Game';
import { Movie } from '../entity/Movie';
import { User } from '../entity/User';
import { EntityNotFoundException } from '../exception/EntityNotFoundException';
import { GameRepository } from '../repository/GameRepository';
import { UserRepository } from '../repository/UserRepository';
import { MovieRepository } from './../repository/MovieRepository';

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
}
