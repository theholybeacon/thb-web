--liquibase formatted sql

-- Changeset andres:1
-- Labels: User
-- Context: initial setup
-- Comment: Create User table
CREATE TABLE "User" (
    id UUID PRIMARY KEY NOT NULL,
    name VARCHAR(50) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL
);
-- Rollback
-- DROP TABLE "User";

-- Changeset andres:2
-- Labels: Bible
-- Context: initial setup
-- Comment: Create Bible table
CREATE TABLE "Bible" (
    bible_id UUID PRIMARY KEY NOT NULL,
    api_id VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    language VARCHAR(50) NOT NULL,
    version VARCHAR(50),
    description TEXT,
    num_books INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Rollback
-- DROP TABLE "Bible";

-- Changeset andres:3
-- Labels: Book
-- Context: initial setup
-- Comment: Create Book table
CREATE TABLE "Book" (
    book_id UUID PRIMARY KEY NOT NULL,
    bible_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    book_order INT NOT NULL,
    abbreviation VARCHAR(10),
    num_chapters INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bible_id) REFERENCES "Bible"(bible_id) ON DELETE CASCADE
);
-- Rollback
-- DROP TABLE "Book";

-- Changeset andres:4
-- Labels: Chapter
-- Context: initial setup
-- Comment: Create Chapter table
CREATE TABLE "Chapter" (
    chapter_id UUID PRIMARY KEY NOT NULL,
    book_id UUID NOT NULL,
    chapter_number INT NOT NULL,
    num_verses INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES "Book"(book_id) ON DELETE CASCADE
);
-- Rollback
-- DROP TABLE "Chapter";

-- Changeset andres:5
-- Labels: Verse
-- Context: initial setup
-- Comment: Create Verse table (Optional)
CREATE TABLE "Verse" (
    verse_id UUID PRIMARY KEY NOT NULL,
    chapter_id UUID NOT NULL,
    verse_number INT NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chapter_id) REFERENCES "Chapter"(chapter_id) ON DELETE CASCADE
);
-- Rollback
-- DROP TABLE "Verse";

-- Changeset andres:6
-- Labels: Study
-- Context: initial setup
-- Comment: Create Study table
CREATE TABLE "Study" (
    study_id UUID PRIMARY KEY NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Rollback
-- DROP TABLE "Study";

-- Changeset andres:7
-- Labels: StudyStep
-- Context: initial setup
-- Comment: Create StudyStep table
CREATE TABLE "StudyStep" (
    study_step_id UUID PRIMARY KEY NOT NULL,
    study_id UUID NOT NULL,
    step_number INT NOT NULL,
    description TEXT,
    step_type VARCHAR(20) NOT NULL,      -- 'book', 'book_range', 'chapter_range', 'verse_range'
    
    -- For Book or Book Range
    start_book_id UUID,
    end_book_id UUID,
    
    -- For Chapter Range or Verse Range
    start_chapter INT,
    end_chapter INT,
    
    -- For Verse Range
    start_verse INT,
    end_verse INT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (study_id) REFERENCES "Study"(study_id) ON DELETE CASCADE,
    FOREIGN KEY (start_book_id) REFERENCES "Book"(book_id) ON DELETE CASCADE,
    FOREIGN KEY (end_book_id) REFERENCES "Book"(book_id) ON DELETE CASCADE,
    
    CHECK (
        (step_type = 'book' AND start_book_id IS NOT NULL AND end_book_id IS NULL AND start_chapter IS NULL AND end_chapter IS NULL AND start_verse IS NULL AND end_verse IS NULL) OR
        (step_type = 'book_range' AND start_book_id IS NOT NULL AND end_book_id IS NOT NULL AND start_chapter IS NULL AND end_chapter IS NULL AND start_verse IS NULL AND end_verse IS NULL) OR
        (step_type = 'chapter_range' AND start_book_id IS NOT NULL AND end_book_id IS NULL AND start_chapter IS NOT NULL AND end_chapter IS NOT NULL AND start_verse IS NULL AND end_verse IS NULL) OR
        (step_type = 'verse_range' AND start_book_id IS NOT NULL AND end_book_id IS NULL AND start_chapter IS NOT NULL AND end_chapter IS NOT NULL AND start_verse IS NOT NULL AND end_verse IS NOT NULL)
    )
);
-- Rollback
-- DROP TABLE "StudyStep";

-- Changeset andres:8
-- Labels: Session
-- Context: initial setup
-- Comment: Create Session table
CREATE TABLE "Session" (
    session_id UUID PRIMARY KEY NOT NULL,
    user_id UUID NOT NULL,
    study_id UUID NOT NULL,
    current_step INT DEFAULT 1,
    current_book_id UUID,
    current_chapter_id UUID,
    progress_detail TEXT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE,
    FOREIGN KEY (study_id) REFERENCES "Study"(study_id) ON DELETE CASCADE,
    FOREIGN KEY (current_book_id) REFERENCES "Book"(book_id) ON DELETE SET NULL,
    FOREIGN KEY (current_chapter_id) REFERENCES "Chapter"(chapter_id) ON DELETE SET NULL,
    
    UNIQUE (user_id, study_id)
);
-- Rollback
-- DROP TABLE "Session";

-- Changeset andres:9
-- Labels: UserStudyProgress
-- Context: initial setup
-- Comment: Create UserStudyProgress table
CREATE TABLE "UserStudyProgress" (
    progress_id UUID PRIMARY KEY NOT NULL,
    session_id UUID NOT NULL,
    book_id UUID NOT NULL,
    chapter_id UUID NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    
    FOREIGN KEY (session_id) REFERENCES "Session"(session_id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES "Book"(book_id) ON DELETE CASCADE,
    FOREIGN KEY (chapter_id) REFERENCES "Chapter"(chapter_id) ON DELETE CASCADE,
    
    UNIQUE (session_id, book_id, chapter_id)
);
-- Rollback
-- DROP TABLE "UserStudyProgress";

-- Changeset andres:10
-- Labels: idx_book_bible_id
-- Context: initial setup
-- Comment: Create index on Book.bible_id
CREATE INDEX idx_book_bible_id ON "Book"(bible_id);
-- Rollback
-- DROP INDEX idx_book_bible_id;

-- Changeset andres:11
-- Labels: idx_chapter_book_id
-- Context: initial setup
-- Comment: Create index on Chapter.book_id
CREATE INDEX idx_chapter_book_id ON "Chapter"(book_id);
-- Rollback
-- DROP INDEX idx_chapter_book_id;

-- Changeset andres:12
-- Labels: idx_studystep_study_id
-- Context: initial setup
-- Comment: Create index on StudyStep.study_id
CREATE INDEX idx_studystep_study_id ON "StudyStep"(study_id);
-- Rollback
-- DROP INDEX idx_studystep_study_id;

-- Changeset andres:13
-- Labels: idx_session_user_id
-- Context: initial setup
-- Comment: Create index on Session.user_id
CREATE INDEX idx_session_user_id ON "Session"(user_id);
-- Rollback
-- DROP INDEX idx_session_user_id;

-- Changeset andres:14
-- Labels: idx_userstudyprogress_session_id
-- Context: initial setup
-- Comment: Create index on UserStudyProgress.session_id
CREATE INDEX idx_userstudyprogress_session_id ON "UserStudyProgress"(session_id);
-- Rollback
-- DROP INDEX idx_userstudyprogress_session_id;

-- Changeset andres:15
-- Context: initial setup
-- Comment: Enable uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Rollback
-- DROP EXTENSION IF EXISTS "uuid-ossp";

-- Changeset andres:16 splitStatements:false endDelimiter:$$
CREATE OR REPLACE FUNCTION bible_create(
    api_id VARCHAR(255),
    name VARCHAR(100),
    language VARCHAR(50),
    version VARCHAR(50) = NULL,
    description TEXT = NULL
) RETURNS UUID AS $$
DECLARE
    v_bible_id UUID;
BEGIN
    v_bible_id := uuid_generate_v4();
    INSERT INTO "Bible" (bible_id, api_id, name, language, version, description, num_books)
    VALUES (v_bible_id, api_id, name, language, version, description, 0);
    RETURN v_bible_id;
END;
$$ LANGUAGE plpgsql;
-- Rollback
-- DROP FUNCTION bible_create(VARCHAR(255), VARCHAR(100), VARCHAR(50), VARCHAR(50), TEXT);

-- Changeset andres:17 splitStatements:false endDelimiter:$$
CREATE OR REPLACE FUNCTION book_create(
    p_bible_id UUID,
    name VARCHAR(100),
    book_order INT,
    abbreviation VARCHAR(10) = NULL
) RETURNS UUID AS $$
DECLARE
    v_book_id UUID;
BEGIN
    v_book_id := uuid_generate_v4();
    INSERT INTO "Book" (book_id, bible_id, name, book_order, abbreviation, num_chapters)
    VALUES (v_book_id, p_bible_id, name, book_order, abbreviation, 0);

    /* Update the number of books in the Bible */
    UPDATE "Bible"
    SET num_books = num_books + 1, updated_at = CURRENT_TIMESTAMP
    WHERE bible_id = p_bible_id;

    RETURN v_book_id;
END;
$$ LANGUAGE plpgsql;
-- Rollback
-- DROP FUNCTION book_create(UUID, VARCHAR(100), INT, VARCHAR(10));

-- Changeset andres:18 splitStatements:false endDelimiter:$$
CREATE OR REPLACE FUNCTION chapter_create(
    p_book_id UUID,
    chapter_number INT,
    num_verses INT
) RETURNS UUID AS $$
DECLARE
    v_chapter_id UUID;
BEGIN
    v_chapter_id := uuid_generate_v4();
    INSERT INTO "Chapter" (chapter_id, book_id, chapter_number, num_verses)
    VALUES (v_chapter_id, p_book_id, chapter_number, num_verses);

    RETURN v_chapter_id;
END;
$$ LANGUAGE plpgsql;
-- Rollback
-- DROP FUNCTION chapter_create(UUID, INT, INT);

-- Changeset andres:19 splitStatements:false endDelimiter:$$
CREATE OR REPLACE FUNCTION verse_create(
    p_chapter_id UUID,
    verse_number INT,
    text TEXT
) RETURNS UUID AS $$
DECLARE
    v_verse_id UUID;
BEGIN
    v_verse_id := uuid_generate_v4();
    INSERT INTO "Verse" (verse_id, chapter_id, verse_number, text)
    VALUES (v_verse_id, p_chapter_id, verse_number, text);

    RETURN v_verse_id;
END;
$$ LANGUAGE plpgsql;
-- Rollback
-- DROP FUNCTION verse_create(UUID, INT, TEXT);

-- Changeset andres:20 splitStatements:false endDelimiter:$$
CREATE OR REPLACE FUNCTION chapter_get_verses(
    _chapter_id UUID
) RETURNS TABLE(
    verse_id UUID,
    chapter_id UUID,
    verse_number INT,
    text TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT verse_id, chapter_id, verse_number, text
    FROM "Verse"
    WHERE chapter_id = _chapter_id
    ORDER BY verse_number;
END;
$$ LANGUAGE plpgsql;
-- Rollback
-- DROP FUNCTION chapter_get_verses(UUID);

-- Changeset andres:21 splitStatements:false endDelimiter:$$
CREATE OR REPLACE FUNCTION chapter_get_previous(
    _chapter_id UUID
) RETURNS TABLE(
    prev_chapter_id UUID,
    chapter_number INT,
    name VARCHAR
) AS $$
DECLARE
    v_book_id UUID;
    v_chapter_number INT;
BEGIN
    /* Retrieve the current chapter's book ID and chapter number */
    SELECT book_id, chapter_number INTO v_book_id, v_chapter_number
    FROM "Chapter"
    WHERE chapter_id = _chapter_id;

    /* Find the previous chapter in the same book */
    RETURN QUERY
    SELECT chapter_id, chapter_number, 'Chapter ' || chapter_number AS name
    FROM "Chapter"
    WHERE book_id = v_book_id AND chapter_number < v_chapter_number
    ORDER BY chapter_number DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;
-- Rollback
-- DROP FUNCTION chapter_get_previous(UUID);

-- Changeset andres:22 splitStatements:false endDelimiter:$$
CREATE OR REPLACE FUNCTION chapter_get_next(
    _chapter_id UUID
) RETURNS TABLE(
    next_chapter_id UUID,
    chapter_number INT,
    name VARCHAR
) AS $$
DECLARE
    v_book_id UUID;
    v_chapter_number INT;
BEGIN
    /* Retrieve the current chapter's book ID and chapter number */
    SELECT book_id, chapter_number INTO v_book_id, v_chapter_number
    FROM "Chapter"
    WHERE chapter_id = _chapter_id;

    /* Find the next chapter in the same book */
    RETURN QUERY
    SELECT chapter_id, chapter_number, 'Chapter ' || chapter_number AS name
    FROM "Chapter"
    WHERE book_id = v_book_id AND chapter_number > v_chapter_number
    ORDER BY chapter_number ASC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;
-- Rollback
-- DROP FUNCTION chapter_get_next(UUID);

-- Changeset andres:23 splitStatements:false endDelimiter:$$
CREATE OR REPLACE FUNCTION bible_get_all()
RETURNS TABLE(
    bible_id UUID,
    api_id VARCHAR(255),
    name VARCHAR(100),
    language VARCHAR(50),
    version VARCHAR(50),
    description TEXT,
    num_books INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT b.bible_id, b.api_id, b.name, b.language, b.version, b.description, b.num_books, b.created_at, b.updated_at
    FROM "Bible" b
    ORDER BY b.name;
END;
$$ LANGUAGE plpgsql;

-- Changeset andres:24 splitStatements:false endDelimiter:$$
CREATE OR REPLACE FUNCTION book_get_all_by_bible_id(_bible_id UUID)
RETURNS TABLE(
    book_id UUID,
    bible_id UUID,
    name VARCHAR(100),
    book_order INT,
    abbreviation VARCHAR(50),
    num_chapters INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM "Book"
    WHERE _bile_id = bible_id;
END;
$$ LANGUAGE plpgsql;
