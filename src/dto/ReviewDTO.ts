import { Review } from '../entity/Review';

export class ReviewDTO {
  id: number;
  title: string;
  text: string;

  constructor(review: Review) {
    this.id = review.id;
    this.title = review.title;
    this.text = review.text;
  }
}
