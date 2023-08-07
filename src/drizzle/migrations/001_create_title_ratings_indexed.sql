CREATE TABLE IF NOT EXISTS imdb.title_ratings_indexed AS (SELECT * FROM imdb.title_ratings);
CREATE INDEX IF NOT EXISTS title_ratings_idx ON imdb.title_ratings_indexed(averagerating);