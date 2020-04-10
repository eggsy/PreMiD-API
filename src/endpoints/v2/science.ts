import { RequestHandler } from "express";
import { pmdDB } from "../../db/client";

//* Define credits collection
const science = pmdDB.collection("science");

//* Request Handler
const handler: RequestHandler = (req, res) => {
	if (req.method === "POST") {
		if (
			!req.body.identifier ||
			typeof req.body.identifier !== "string" ||
			!req.body.presences ||
			!Array.isArray(req.body.presences)
		) {
			res.sendStatus(404);
			return;
		}

		let data: any = {
			identifier: req.body.identifier,
			presences: req.body.presences,
			updated: Date.now()
		};

		if (req.body.platform) data.platform = req.body.platform;

		science
			.findOneAndUpdate(
				{ identifier: req.body.identifier },
				{
					$set: data
				},
				{ upsert: true }
			)
			.then(() => res.sendStatus(200))
			.catch(() => res.sendStatus(500));
	} else if (req.method === "DELETE") {
		if (!req.body.identifier) {
			res.sendStatus(404);
			return;
		}

		science
			.findOneAndDelete({ identifier: req.body.identifier })
			.then(response => {
				if (response.value) res.sendStatus(200);
				else res.sendStatus(404);
			})
			.catch(() => res.sendStatus(500));
	}
};

//* Export handler
export { handler };
