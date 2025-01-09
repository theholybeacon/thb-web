
-- Changeset andres:2
-- Labels: User
-- Context: initial setup
-- Comment: Create User table
CREATE TABLE "User" (
    id UUID PRIMARY KEY NOT NULL,
    name VARCHAR(51) NOT NULL,
    username VARCHAR(51) UNIQUE NOT NULL,
    email VARCHAR(51) UNIQUE NOT NULL
);
-- Rollback
-- DROP TABLE "User";


-- Changeset andres:3
-- Labels: Bible
-- Context: initial setup
-- Comment: Create Bible table
CREATE TABLE "Bible" (
    bible_id UUID PRIMARY KEY NOT NULL,
    name VARCHAR(101) NOT NULL,
    language VARCHAR(51) NOT NULL,
    version VARCHAR(51),
    description TEXT,
    num_books INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Rollback
-- DROP TABLE "Bible";

-- Changeset andres:4
-- Labels: Book
-- Context: initial setup
-- Comment: Create Book table
CREATE TABLE "Book" (
    book_id UUID PRIMARY KEY NOT NULL,
    bible_id UUID NOT NULL,
    name VARCHAR(101) NOT NULL,
    book_order INT NOT NULL,
    abbreviation VARCHAR(11),
    num_chapters INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bible_id) REFERENCES "Bible"(bible_id) ON DELETE CASCADE
);
-- Rollback
-- DROP TABLE "Book";

-- Changeset andres:5
-- Labels: Chapter
-- Context: initial setup
-- Comment: Create Chapter table
CREATE TABLE "Chapter" (
    chapter_id UUID PRIMARY KEY NOT NULL,
    book_id UUID NOT NULL,
    chapter_number INT NOT NULL,
    num_verses INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES "Book"(book_id) ON DELETE CASCADE
);
-- Rollback
-- DROP TABLE "Chapter";

-- Changeset andres:6
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

-- Changeset andres:7
-- Labels: Study
-- Context: initial setup
-- Comment: Create Study table
CREATE TABLE "Study" (
    study_id UUID PRIMARY KEY NOT NULL,
    name VARCHAR(101) NOT NULL,
    description TEXT,
    type VARCHAR(51),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Rollback
-- DROP TABLE "Study";

-- Changeset andres:8
-- Labels: StudyStep
-- Context: initial setup
-- Comment: Create StudyStep table
CREATE TABLE "StudyStep" (
    study_step_id UUID PRIMARY KEY NOT NULL,
    study_id UUID NOT NULL,
    step_number INT NOT NULL,
    description TEXT,
    step_type VARCHAR(21) NOT NULL,      -- 'book', 'book_range', 'chapter_range', 'verse_range'
    
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

-- Changeset andres:9
-- Labels: Session
-- Context: initial setup
-- Comment: Create Session table
CREATE TABLE "Session" (
    session_id UUID PRIMARY KEY NOT NULL,
    user_id UUID NOT NULL,
    study_id UUID NOT NULL,
    current_step INT DEFAULT 2,
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

-- Changeset andres:10
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
    -- Ensure (book_id, chapter_id) combination exists in Chapter
    FOREIGN KEY (book_id, chapter_id) REFERENCES "Chapter"(book_id, chapter_id) ON DELETE CASCADE,
    
    UNIQUE (session_id, book_id, chapter_id)
);
