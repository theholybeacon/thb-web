import { describe, expect, it } from "vitest";
import { commonsThumbnail } from "./commonsThumbnail";

describe("commonsThumbnail", () => {
	it("narrows a rendition to the asked width", () => {
		expect(commonsThumbnail("https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Dor%C3%A9_Deluge.jpg/1280px-Dor%C3%A9_Deluge.jpg"))
			.toBe("https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Dor%C3%A9_Deluge.jpg/500px-Dor%C3%A9_Deluge.jpg");
		expect(commonsThumbnail("https://thumb.wikimedia.org/wikipedia/commons/thumb/5/56/A.jpg/1280px-A.jpg", 330))
			.toBe("https://thumb.wikimedia.org/wikipedia/commons/thumb/5/56/A.jpg/330px-A.jpg");
	});

	it("turns an original into its rendition", () => {
		expect(commonsThumbnail("https://upload.wikimedia.org/wikipedia/commons/e/e2/Tissot_Zacchaeus.jpg"))
			.toBe("https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Tissot_Zacchaeus.jpg/500px-Tissot_Zacchaeus.jpg");
	});

	it("leaves anything else alone", () => {
		expect(commonsThumbnail("https://example.com/a.jpg")).toBe("https://example.com/a.jpg");
		expect(commonsThumbnail("https://upload.wikimedia.org/wikipedia/commons/a/ab/Map.svg"))
			.toBe("https://upload.wikimedia.org/wikipedia/commons/a/ab/Map.svg");
		expect(commonsThumbnail("not a url")).toBe("not a url");
	});
});
