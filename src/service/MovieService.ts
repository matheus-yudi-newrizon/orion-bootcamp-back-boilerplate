import { Service } from 'typedi';
import { Movie } from '../entity/Movie';
import { MovieNotFoundException } from '../exception/MovieNotFoundException';
import { MovieRepository } from './../repository/MovieRepository';
import { MovieDTO } from '../dto/MovieDTO';

@Service()
export class MovieService {
  constructor(private readonly movieRepository: MovieRepository) {}

  /**
   * Search movies by title.
   *
   * @param title - The title of the movie.
   *
   * @returns A promise that resolves with the filtered movies.
   * @throws {DatabaseOperationFailException} if there is a database operation failure.
   * @throws {MovieNotFoundException} if the movie is not found.
   */
  public async searchMoviesByTitle(title: string): Promise<MovieDTO[]> {
    const filteredMovies: Movie[] = await this.movieRepository.getByTitle(title);
    if (filteredMovies.length === 0) throw new MovieNotFoundException();

    const movies: MovieDTO[] = filteredMovies.map(movie => new MovieDTO(movie));
    return movies;
  }
}
