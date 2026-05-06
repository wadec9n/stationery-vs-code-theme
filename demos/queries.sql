-- Bookshop schema and analytics queries.
-- Showcases DDL, constraints, indexes, CTEs, window functions,
-- joins, aggregates, and string/date functions.

BEGIN;

CREATE SCHEMA IF NOT EXISTS shop;

CREATE TABLE shop.author (
    id          BIGSERIAL PRIMARY KEY,
    full_name   TEXT        NOT NULL,
    born_on     DATE,
    died_on     DATE,
    CONSTRAINT  born_before_died CHECK (died_on IS NULL OR born_on < died_on)
);

CREATE TABLE shop.book (
    id          BIGSERIAL PRIMARY KEY,
    isbn        CHAR(13)    UNIQUE NOT NULL,
    title       TEXT        NOT NULL,
    author_id   BIGINT      NOT NULL REFERENCES shop.author(id) ON DELETE RESTRICT,
    price_cents INTEGER     NOT NULL CHECK (price_cents >= 0),
    published   DATE        NOT NULL,
    tags        TEXT[]      DEFAULT '{}',
    metadata    JSONB       DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX book_author_idx ON shop.book (author_id);
CREATE INDEX book_tags_gin   ON shop.book USING GIN (tags);

CREATE TABLE shop.sale (
    id          BIGSERIAL PRIMARY KEY,
    book_id     BIGINT      NOT NULL REFERENCES shop.book(id),
    sold_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    quantity    INTEGER     NOT NULL CHECK (quantity > 0),
    discount    NUMERIC(4,3) DEFAULT 0.000
);

INSERT INTO shop.author (full_name, born_on) VALUES
    ('Ursula K. Le Guin', '1929-10-21'),
    ('Octavia E. Butler', '1947-06-22'),
    ('Italo Calvino',     '1923-10-15');

COMMIT;

-- 1. Top 5 best-selling books last quarter, with rank and lag-on-prior period.
WITH ranged AS (
    SELECT
        b.id,
        b.title,
        SUM(s.quantity)                     AS units,
        SUM(s.quantity * b.price_cents) / 100.0 AS revenue
    FROM shop.book AS b
    JOIN shop.sale AS s ON s.book_id = b.id
    WHERE s.sold_at >= DATE_TRUNC('quarter', NOW()) - INTERVAL '1 quarter'
      AND s.sold_at <  DATE_TRUNC('quarter', NOW())
    GROUP BY b.id, b.title
)
SELECT
    title,
    units,
    revenue,
    RANK()        OVER (ORDER BY units DESC)            AS rnk,
    LAG(units, 1) OVER (ORDER BY units DESC)            AS prev_units,
    ROUND(100.0 * units / SUM(units) OVER (), 2)         AS pct_of_total
FROM ranged
ORDER BY rnk
LIMIT 5;

-- 2. Authors whose books carry the 'classic' tag, with title list.
SELECT
    a.full_name,
    COUNT(*)                                   AS classics_count,
    STRING_AGG(b.title, ', ' ORDER BY b.title) AS titles
FROM shop.author AS a
JOIN shop.book   AS b ON b.author_id = a.id
WHERE 'classic' = ANY(b.tags)
GROUP BY a.id, a.full_name
HAVING COUNT(*) > 1
ORDER BY classics_count DESC, a.full_name;

-- 3. Upsert a price change and return the delta.
INSERT INTO shop.book (isbn, title, author_id, price_cents, published)
VALUES ('9780441569595', 'A Wizard of Earthsea', 1, 1499, '1968-11-01')
ON CONFLICT (isbn) DO UPDATE
    SET price_cents = EXCLUDED.price_cents,
        metadata    = shop.book.metadata || jsonb_build_object('updated_at', NOW())
RETURNING id, title, EXCLUDED.price_cents - shop.book.price_cents AS delta;
