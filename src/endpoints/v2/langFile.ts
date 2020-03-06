import { RequestHandler } from "express";
import { cache } from "../../index";

let langFiles = prepareLangFiles(cache.get("langFiles"));
cache.onUpdate("langFiles", data => (langFiles = prepareLangFiles(data)));

//* Request Handler
const handler: RequestHandler = (req, res) => {
  if (req.path.endsWith("/list")) {
    res.send(
      langFiles.filter(lF => lF.project === "extension").map(lF => lF.lang)
    );
    return;
  }

  if (!req.params["project"] || !req.params["lang"]) {
    res.sendStatus(404);
    return;
  }

  if (!["extension", "website"].includes(req.params["project"])) {
    res.send(404);
    return;
  }

  let langFile = langFiles.find(
    lF => lF.project === req.params["project"] && lF.lang === req.params["lang"]
  );

  if (!langFile) {
    res.send({ error: 6, message: "No translations found." });
    return;
  }

  langFile = { translations: langFile.translations };

  res.send(
    Object.assign(
      {},
      ...Object.keys(langFile.translations).map(translationKey => {
        const newKey = translationKey.replace(/[_]/g, ".");
        return {
          [newKey]: langFile.translations[translationKey]
        };
      })
    )
  );
};

function prepareLangFiles(langFiles) {
  langFiles.map(lF => {
    if (lF.project == "extension") {
      switch (lF.lang) {
        case "ja_JP":
          lF.lang = "ja";
          break;
        case "zh_CN":
          lF.lang = "zh-CN";
          break;
        case "zh_TW":
          lF.lang = "zh-TW";
          break;
        case "zh_HK":
          lF.lang = "zh-TW";
          break;
        case "ko_KR":
          lF.lang = "ko";
          break;
      }
    } else if (lF.project == "website") {
      switch (lF.lang.toLowerCase()) {
        case "ja":
          lF.lang = "ja_JP";
          break;
        case "zh-cn":
          lF.lang = "zh_CN";
          break;
        case "zh-tw":
          lF.lang = "zh_TW";
          break;
        case "ko":
          lF.lang = "ko_KR";
          break;
        default:
          break;
      }
    } else return;
  });
  return langFiles;
}

//* Export handler
export { handler };
