import { Movie } from '../entity';

export class MovieDTO {
  id: number;
  title: string;
  posterPath: string;
  releaseDate: Date;

  constructor(movie: Movie) {
    this.id = movie.id;
    this.title = movie.title;
    this.posterPath = movie.posterPath;
    this.releaseDate = movie.releaseDate;
  }
}
