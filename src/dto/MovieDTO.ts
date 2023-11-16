import { Movie } from '../entity/Movie';

export class MovieDTO {
  title: string;
  posterPath: string;
  releaseDate: Date;

  constructor(movie: Movie) {
    this.title = movie.title;
    this.posterPath = movie.posterPath;
    this.releaseDate = movie.releaseDate;
  }
}
