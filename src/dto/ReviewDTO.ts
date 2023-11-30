import { Review } from '../entity/Review';

export class ReviewDTO {
  id: string;
  text: string;
  author: string;

  constructor(review: Review) {
    this.id = review.id;
    this.text = review.text;
    this.author = review.author;
  }
}
