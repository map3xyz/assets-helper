CREATE TABLE IF NOT EXISTS network (
    id           varchar(36) PRIMARY KEY,
    network_code varchar(200) NOT NULL,
    network_data blob,
    hash         varchar(64),
    created_date datetime NOT NULL,
    updated_date datetime
);

CREATE UNIQUE INDEX IF NOT EXISTS network_code_idx ON network (network_code);

CREATE TABLE IF NOT EXISTS asset (
    id                 varchar(36) PRIMARY KEY,
    network_code       varchar(200) NOT NULL,
    address            varchar(200),
    asset_data         blob,
    hash               varchar(64),
    created_date       datetime NOT NULL,
    updated_date       datetime
);

CREATE UNIQUE INDEX IF NOT EXISTS asset_network_idx ON asset (network_code, address);

CREATE TABLE IF NOT EXISTS asset_map (
    from_id         varchar(36) NOT NULL REFERENCES asset(id),
    from_address    varchar(200),
    from_network    varchar(200) NOT NULL,
    to_id           varchar(36) NOT NULL REFERENCES asset(id),
    to_address      varchar(200),
    to_network      varchar(200) NOT NULL,
    type            varchar(36) NOT NULL,
    data            blob NOT NULL,
    hash            varchar(64),
    created_date    datetime NOT NULL,
    updated_date    datetime
);

CREATE INDEX IF NOT EXISTS asset_map_from_id_idx ON asset_map (from_id);
CREATE INDEX IF NOT EXISTS asset_map_to_id_idx ON asset_map (to_id);
