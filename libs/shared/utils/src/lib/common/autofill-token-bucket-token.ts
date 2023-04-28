export class AutofillTokenBucketToken {
  private setRefillDate;

  constructor(setRefillDate: (date: Date) => void) {
    this.setRefillDate = setRefillDate;
  }

  setDate(date: Date) {
    if (this.setRefillDate) this.setRefillDate(date);
  }
}
