// -----------------------------------------------------------------------------------------------------------
// | METHOD | ENDPOINT                           | DESCRIPTION                                               |
// -----------------------------------------------------------------------------------------------------------
// | GET    | /api/perks                         | Returns with all perks                                    |
// | GET    | /api/perks?rating=[S/A/B/C/D]      | Returns with all perks for the specified Tier Rating      |
// | GET    | /api/perks?perk=[perk name]        | Returns with an array of perks that match the given perk  |
// | GET    | /api/perks?character=[name]        | Returns with all perks for a given survivor/killer        |
// | GET    | /api/maps                          | Returns with all regions                                  |   
// | GET    | /api/maps?map=[name]               | Returns with data of the specified map                    |
// | GET    | /api/region?region=[name]          | Returns with data of the specified region                 |
// -----------------------------------------------------------------------------------------------------------

const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

const perks = require("./perks.json");
const regions = require('./regions.json');

app.get("/api/perks", (req, res) => {
    var url = new URL("http://localhost" + req.url);
    var params = url.searchParams;

    var rating = params.get("rating");
    if (rating != null) return res.send(handleRating(rating));

    var perk = params.get("perk");
    if (perk != null) return res.send(handleQuery(perk));

    var character = params.get("character");
    if (character != null) return res.send(handleCharacter(character));

    return res.json(perks);
});

app.get("/api/maps", (req, res) => {
    var url = new URL("http://localhost" + req.url);
    var params = url.searchParams;

    var mapName = params.get("map");
    if (mapName != null) return res.send(handleMap(mapName));

    return res.json(maps);
});

app.get("/api/region", (req, res) => {
    var url = new URL("http://localhost" + req.url);
    var params = url.searchParams;

    var regionName = params.get("region");
    if (regionName != null) return res.send(handleRegion(regionName));

    return res.json(maps);
});

app.get("*", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

function handleMap(query) {
    query = query.toLowerCase().replace(/[^a-z]/g, "");
    if (query.length < 3) {
        return [];
    }

    var res = [];
    for (var region of regions) {
        for (var map of region.maps) { 
            if (map.name.toLowerCase().replace(/[^a-z]/g, "").indexOf(query)) {
                res.push(map);
            }
        }
    }

    return res;
}

function handleRegion(query) {
    query = query.toLowerCase().replace(/[^a-z]/g, "");
    if (query.length < 3) {
        return [];
    }

    var res = [];
    for (var region of regions) {
        if (region.name.toLowerCase().replace(/[^a-z]/g, "").indexOf(query)) {
            res.push(region);
        }
    }

    return res;
}

var ratingMap = {
    S: [4.5, 5.1],
    A: [4, 4.5],
    B: [3, 4],
    C: [2.1, 3],
    D: [0, 2.1],
};

function handleRating(rating) {
    var keys = Object.keys(ratingMap);
    rating = rating.toUpperCase();

    if (!keys.includes(rating))
        return {
            error: `invalid rating given, valid options are: ${keys.join(", ")}`,
        };

    return perks.filter(
        (perk) =>
            perk.rating >= ratingMap[rating][0] && perk.rating < ratingMap[rating][1]
    );
}

function handleQuery(query) {
    query = query.toLowerCase().replace(/[^a-z]/g, "");

    if (query.length == 0) return { error: "query must not be empty" };
    if (query.length < 3 || query.length > 20)
        return { error: "query must be between 3 and 20 chars long" };

    return perks.filter(
        (p) =>
            p.perk_name
                .toLowerCase()
                .replace(/[^a-z]/g, "")
                .indexOf(query) > -1
    );
}

function handleCharacter(character) {
    character = character.toLowerCase().replace(/[^a-z]/g, "");

    if (character.length == 0) return { error: "character must not be empty" };
    if (character.length < 3 || character.length > 20)
        return { error: "character must be between 3 and 20 chars long" };

    return perks.filter((p) => p.name.toLowerCase().indexOf(character) > -1);
}

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
