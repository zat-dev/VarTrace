CREATE TABLE metadata (
    version TEXT, 
    language TEXT, 
    status TEXT, 
    max_step INTEGER,
    base_path TEXT
);

CREATE TABLE files (
    file_id INTEGER,
    file_abs_path TEXT NOT NULL UNIQUE,
    mod_timestamp INTEGER NOT NULL, /* unix time */
    PRIMARY KEY(file_id)
);

CREATE TABLE functions (
    function_id INTEGER,
    function_name TEXT UNIQUE,
    PRIMARY KEY(function_id)
);

CREATE TABLE steps (
    step INTEGER, 
    step_kind TEXT, /* ex: line(statement), exception, return, call */
    file_id INTEGER, 
    line INTEGER NOT NULL, 
    function_id INTEGER,
    return_snap JSON, /* retrun value of function or throwed exception value */
    local_scope_id INTEGER,
    global_scope_id INTEGER,
    PRIMARY KEY(step),
    FOREIGN KEY(file_id) REFERENCES files(file_id),
    FOREIGN KEY(function_id) REFERENCES functions(function_id),
    FOREIGN KEY(local_scope_id) REFERENCES scopes(scope_id),
    FOREIGN KEY(global_scope_id) REFERENCES scopes(scope_id)
);

CREATE TABLE scopes (
    scope_id INTEGER, 
    scope_name TEXT NOT NULL, 
    scope_kind TEXT,
    start INTEGER NOT NULL, 
    end INTEGER, 
    PRIMARY KEY(scope_id),
    UNIQUE(scope_name, scope_kind, start)
);
CREATE TABLE variables (
    var_id INTEGER, 
    var_name TEXT NOT NULL, 
    defined_step INTEGER NOT NULL, 
    scope_id INTEGER, 
    PRIMARY KEY(var_id),
    FOREIGN KEY(scope_id) REFERENCES scopes(scope_id)
);
CREATE TABLE variable_values (
    step INTEGER, 
    var_id INTEGER, 
    value JSON,
    prevValue JSON,  
    PRIMARY KEY(step, var_id),
    FOREIGN KEY(var_id) REFERENCES variables(var_id)   
);

PRAGMA journal_mode = wal;
PRAGMA synchronous = off;
PRAGMA temp_store = memory;
PRAGMA mmap_size = 30000000000; /* about 30GB */
PRAGMA foreign_keys = true;