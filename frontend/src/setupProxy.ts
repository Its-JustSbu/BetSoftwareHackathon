import { IncomingMessage, ServerResponse } from "http";
import { createProxyMiddleware, RequestHandler } from "http-proxy-middleware";

module.exports = function (app: {
  use: (
    arg0: string,
    arg1: RequestHandler<
      IncomingMessage,
      ServerResponse<IncomingMessage>,
      (err?: any) => void
    >
  ) => void;
}) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:800/",
      changeOrigin: true,
    })
  );
};
