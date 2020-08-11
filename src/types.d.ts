export interface ServerOptions {
  server: {
    port: number;
  };
  helmet: {
    use: "true" | "false";
    options: {
      x_powered_by: "true" | "false";
      frameguard: "true" | "false";
      dnsPrefetchControl: "true" | "false";
      hsts: "true" | "false";
      ieNoOpen: "true" | "false";
      noSniff: "true" | "false";
    };
  };
  prometheus: {
    use: "true" | "false";
  };
}
