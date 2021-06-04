module.exports.createTables = function createTables() {
    connection.query(`
    CREATE TABLE IF NOT EXISTS users (
        name VARCHAR(128), 
        discriminator SMALLINT NOT NULL, 
        access_token VARCHAR(30), 
        refresh_token VARCHAR(30), 
        avatar VARCHAR(128), 
        id VARCHAR(32), 
        bio VARCHAR(512),
        banner VARCHAR(512), 
        catchScores TEXT, 
        royaleScores TEXT, 
        authToken TEXT, 
        roles TEXT
    )
    `);
    connection.query(`
    CREATE TABLE IF NOT EXISTS posts (
        title VARCHAR(64), 
        author VARCHAR(20), 
        text VARCHAR(2500), 
        thumbnailPath VARCHAR(128), 
        url VARCHAR(64), 
        date DATETIME, 
        id VARCHAR(32)
    )
    `);
    connection.query(`
    CREATE TABLE IF NOT EXISTS beatmaps (
        title VARCHAR(128), 
        artist VARCHAR(128), 
        difficulty VARCHAR(128), 
        path VARCHAR(128) NOT NULL, 
        length SMALLINT DEFAULT 0, 
        creator VARCHAR(128), 
        sampleset VARCHAR(128) DEFAULT 'Soft' NOT NULL, 
        approachrate SMALLINT DEFAULT 9 NOT NULL,
        circlesize SMALLINT DEFAULT 4 NOT NULL,
        bpm FLOAT DEFAULT 90 NOT NULL,
        previewtime INT DEFAULT 0 NOT NULL,
        id INT NOT NULL AUTO_INCREMENT,
        stars FLOAT NOT NULL DEFAULT 0,
        tags TEXT,
        colors TEXT,
        PRIMARY KEY(id)
    )
    `);
    connection.query(`
    CREATE TABLE IF NOT EXISTS mudae (
        id VARCHAR(32) NOT NULL,
        username VARCHAR(64), 
        avatar VARCHAR(128), 
        hasClaim BOOLEAN, 
        reactPower TINYINT, 
        reactCost TINYINT, 
        lastAction DATETIME, 
        reactCap TINYINT DEFAULT 100,
        primary key (id)
    )
    `);
}