import { AutofillTokenBucketToken } from './autofill-token-bucket-token';

export class AutofillTokenBucket {
  public lastRefillDate!: Date;
  public readonly maxTokens: number;
  public readonly refillRate: number;
  public tokensNumber!: number;

  constructor(maxTokens: number, refillRate: number) {
    this.maxTokens = maxTokens;
    this.refillRate = refillRate;
    this.refill();
  }

  refill() {
    this.lastRefillDate = new Date();
    this.tokensNumber = this.maxTokens;
  }

  isLastRefillDateExpired() {
    return (
      this.lastRefillDate.getTime() + this.refillRate * 1000 <=
      new Date().getTime()
    );
  }

  getTimeBeforeNextToken() {
    return (
      this.lastRefillDate.getTime() +
      this.refillRate * 1000 -
      new Date().getTime()
    );
  }

  async getToken() {
    const refillIsExpired = this.isLastRefillDateExpired();
    if (!refillIsExpired) {
      if (this.tokensNumber <= 0) {
        await new Promise((resolve) =>
          setTimeout(resolve, this.getTimeBeforeNextToken())
        );
        this.refill();
      }
    } else {
      this.refill();
    }
    this.tokensNumber--;
    return new AutofillTokenBucketToken((date: Date) => {
      if (refillIsExpired) this.lastRefillDate = date;
    });
  }
}
