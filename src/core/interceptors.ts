export class InterceptorManager {
  private interceptors: Function[] = [];

  use(interceptor: Function) {
    this.interceptors.push(interceptor);
    return () => {
      const index = this.interceptors.indexOf(interceptor);
      if (index !== -1) {
        this.interceptors.splice(index, 1);
      }
    };
  }

  async execute(config: any) {
    let result = config;
    for (const interceptor of this.interceptors) {
      result = await interceptor(result);
    }
    return result;
  }
}
