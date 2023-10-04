import express from "express";
import { prerender } from "./prerender";
import { fetchAvailableUrls } from "./urls";

const port = "1234";
const app = express();

app.get("/generate", async (req, res) => {
  console.log("req.queryParams", req.query);

  let urlsArray;
  if (req.query?.url) {
    urlsArray = [req.query.url];
  } else {
    try {
      urlsArray = await fetchAvailableUrls();
    } catch (e) {
      console.log(e);
    }
  }

  await prerender(urlsArray);
  res?.send("Static pages are generated!");
});

app.listen(port, () => {
  console.log("");
  console.log(`> Generate all pages      ${`http://localhost:${port}/generate`}`);
  console.log(
    `> Generate specific page  ${`http://localhost:${port}/generate?url=/my-page/url`}`
  );
});
