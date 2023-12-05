import { Review } from '../entity';

export class ReviewDTO {
  text: string;
  author: string;

  constructor(review: Review) {
    this.text = review.text;
    this.author = review.author;
  }
}
