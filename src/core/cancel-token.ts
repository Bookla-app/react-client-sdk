export class CancelToken {
    private isCancelled = false;

    cancel() {
        this.isCancelled = true;
    }

    get cancelled() {
        return this.isCancelled;
    }
}