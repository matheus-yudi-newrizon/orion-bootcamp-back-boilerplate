import { Review } from '../entity/Review';

export class ReviewDTO {
  id: string;
  text: string;

  constructor(review: Review) {
    this.id = review.id;
    this.text = review.text;
  }
}
