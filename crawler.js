const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");
const cors = require("cors");
const app = express();
const fs = require("fs");

const corsOpts = {
  origin: "*",

  methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],

  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOpts));

async function main() {
  let url = "";
  let depth = 0;
  process.argv.forEach((item) => {
    if (item.includes("start_url")) {
      url = item.split("#")[1];
    }

    if (item.includes("depth")) {
      depth = item.split("#")[1];
    }
  });

  const uRLsToVisit = [];
  uRLsToVisit.push(url);
  const visitedURLs = [];
  const outputURLs = [];

  for (let i = 0; i <= depth; i++) {
    const currentUrl = uRLsToVisit.pop();
	console.log("currentUrl", currentUrl);
	const pageHTML = await axios({
		headers: { Accept: 'text/html, application/json, text/plain, */*' },
		url: currentUrl,
		method: 'get'
	  });

    visitedURLs.push(currentUrl);

    const $ = cheerio.load(pageHTML.data);

    $("*").each((index, element) => {
	  if ($(element)?.is("img")) {
			let imgUrl = $(element).attr("src");
			outputURLs.push({
						  imageUrl: imgUrl,
						  sourceUrl: currentUrl,
						  depth: i,
						});
		}

		// if ($(element).not('script').not('link').not('nav').attr('href')) {
			if($(element)?.attr('href')?.includes(currentUrl)) {
			  	const elUrl = $(element).attr("href");
				if(!visitedURLs.includes(elUrl) && !uRLsToVisit.includes(elUrl)) {
					uRLsToVisit.push(elUrl);
				}
			}
		// }
    });
  }
//   console.log("uRLsToVisit", uRLsToVisit);
//   console.log("visitedURLs", visitedURLs);
//   console.log("outputURLs", outputURLs);

  fs.writeFileSync('./data.json', JSON.stringify(outputURLs), function (err) {
  	if(err) {
  		console.log(err);
  	} else{
  		console.log("success");
  	}
  });
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    console.error("ERROR", e);

    process.exit(1);
  });
