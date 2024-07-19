-- MySQL 8.0

-- Create the database
DROP DATABASE IF EXISTS Alternakraft;
CREATE DATABASE IF NOT EXISTS Alternakraft;
USE Alternakraft;

-- Tables
CREATE TABLE Household (
  email VARCHAR(250) NOT NULL,
  square_footage INTEGER NOT NULL, -- Piazza @642 "whole numbers" is positive or negative
  household_type VARCHAR(20) NOT NULL,
  thermostat_setting_heating INTEGER NULL,
  thermostat_setting_cooling INTEGER NULL,
  postal_code char(5) NOT NULL,
  PRIMARY KEY email (email)
);

CREATE TABLE `Household-public_utilities` (
  email VARCHAR(250) NOT NULL,
  public_utility VARCHAR(20) NOT NULL,
  PRIMARY KEY (email, public_utility)
);

CREATE TABLE PowerGenerator (
  email VARCHAR(250) NOT NULL,
  order_entered INTEGER UNSIGNED NOT NULL,
  power_generation_type VARCHAR(20) NOT NULL,
  monthly_kWh INTEGER NOT NULL, -- Piazza @642
  storage_kWh INTEGER NULL, -- Piazza @642
  PRIMARY KEY (email, order_entered)
);

CREATE TABLE Location (
  postal_code char(5) NOT NULL,
  city VARCHAR(50) NOT NULL,
  `state` char(2) NOT NULL,
  latitude DECIMAL(25, 15) NOT NULL,
  longitude DECIMAL(25, 15) NOT NULL,
  PRIMARY KEY (postal_code)
);

CREATE TABLE Manufacturer (
  manufacturer_name VARCHAR(250) NOT NULL,
  PRIMARY KEY (manufacturer_name)
);

CREATE TABLE Appliance (
  email VARCHAR(250) NOT NULL,
  order_entered INTEGER UNSIGNED NOT NULL,
  btu_rating INTEGER UNSIGNED NOT NULL,
  model_name VARCHAR(250) NULL,
  manufacturer_name VARCHAR(250) NOT NULL,
  PRIMARY KEY (email, order_entered)
);

CREATE TABLE WaterHeater (
  email VARCHAR(250) NOT NULL,
  order_entered INTEGER UNSIGNED NOT NULL,
  capacity DECIMAL(25, 1) NOT NULL,
  current_temperature_setting INTEGER NULL,
  energy_source VARCHAR(20) NOT NULL,
  PRIMARY KEY (email, order_entered)
);

CREATE TABLE AirHandler (
  email VARCHAR(250) NOT NULL,
  order_entered INTEGER UNSIGNED NOT NULL,
  PRIMARY KEY (email, order_entered)
);

CREATE TABLE AirConditioner (
  email VARCHAR(250) NOT NULL,
  order_entered INTEGER UNSIGNED NOT NULL,
  energy_efficiency_ratio DECIMAL(25, 1),
  PRIMARY KEY (email, order_entered)
);

CREATE TABLE Heater (
  email VARCHAR(250) NOT NULL,
  order_entered INTEGER UNSIGNED NOT NULL,
  energy_source VARCHAR(20) NOT NULL,
  PRIMARY KEY (email, order_entered)
);

CREATE TABLE HeatPump (
  email VARCHAR(250) NOT NULL,
  order_entered INTEGER UNSIGNED NOT NULL,
  heating_seasonal_performance_factor DECIMAL(25, 1) NOT NULL,
  seasonal_energy_efficiency_rating DECIMAL(25, 1) NOT NULL,
  PRIMARY KEY (email, order_entered)
);

-- Foreign Keys: fk_ChildTable_childColumn_ParentTable_parentColumn
ALTER TABLE Household
  ADD CONSTRAINT fk_Household_postal_code_Location_postal_code FOREIGN KEY (postal_code) REFERENCES `Location` (postal_code);
  
ALTER TABLE `Household-public_utilities`
  ADD CONSTRAINT `fk_Household-public_utilities_email_Household_email` FOREIGN KEY (email) REFERENCES Household (email);

ALTER TABLE PowerGenerator
  ADD CONSTRAINT fk_PowerGenerator_email_Household_email FOREIGN KEY (email) REFERENCES Household (email);

ALTER TABLE Appliance
  ADD CONSTRAINT fk_Appliance_email_Household_email FOREIGN KEY (email) REFERENCES Household (email),
  ADD CONSTRAINT fk_Appliance_manufacturer_name_Manufacturer_manufacturer_name
    FOREIGN KEY (manufacturer_name)
    REFERENCES Manufacturer (manufacturer_name);

ALTER TABLE WaterHeater
  ADD CONSTRAINT fk_WaterHeater_primary_key_Appliance_primary_key -- Breaks convention since constraint name too long error
    FOREIGN KEY (email, order_entered)
    REFERENCES Appliance (email, order_entered)
    ON DELETE CASCADE;

ALTER TABLE AirHandler
  ADD CONSTRAINT fk_AirHandler_primary_key_Appliance_primary_key
    FOREIGN KEY (email, order_entered)
    REFERENCES Appliance (email, order_entered)
    ON DELETE CASCADE;
  
ALTER TABLE AirConditioner
  ADD CONSTRAINT fk_AirConditioner_primary_key_AirHandler_primary_key
    FOREIGN KEY (email, order_entered)
    REFERENCES AirHandler (email, order_entered)
    ON DELETE CASCADE;

ALTER TABLE Heater
  ADD CONSTRAINT fk_Heater_primary_key_AirHandler_primary_key
    FOREIGN KEY (email, order_entered)
    REFERENCES AirHandler (email, order_entered)
    ON DELETE CASCADE;

ALTER TABLE HeatPump
  ADD CONSTRAINT fk_HeatPump_primary_key_AirHandler_primary_key -- MySQL: constraint name too long otherwise
    FOREIGN KEY (email, order_entered)
    REFERENCES AirHandler (email, order_entered)
    ON DELETE CASCADE;


-- ^^^^^^^^^^^^^^^^^^^^^^^ Bulk upload Postal Codes ^^^^^^^^^^^^^^^^^^^^^^^

-- Show what the trusted path is - It should be what I defined in composer.yml
SHOW VARIABLES LIKE "secure_file_priv";

-- SELECT @@GLOBAL.sql_mode;
-- SELECT @@SESSION.sql_mode;

-- Now load the data from the .csv file. It runs way faster than simple INSERT statements
LOAD DATA INFILE '/var/lib/mysql-files/postal_codes.csv' INTO TABLE Location FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n' IGNORE 1 ROWS;

-- ^^^^^^^^^^^^^^^^^^^^^^^ Bulk upload the rest of the tables ^^^^^^^^^^^^^^^^^^^^^^^
LOAD DATA INFILE '/var/lib/mysql-files/Manufacturer.csv' INTO TABLE Manufacturer FIELDS TERMINATED BY '\t' LINES TERMINATED BY '\n' IGNORE 1 ROWS;
LOAD DATA INFILE '/var/lib/mysql-files/Household.csv' INTO TABLE Household FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n' IGNORE 1 ROWS;
LOAD DATA INFILE '/var/lib/mysql-files/PowerGenerator.csv' INTO TABLE PowerGenerator FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n' IGNORE 1 ROWS;
LOAD DATA INFILE '/var/lib/mysql-files/Appliance.csv' INTO TABLE Appliance FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n' IGNORE 1 ROWS;
LOAD DATA INFILE '/var/lib/mysql-files/WaterHeater.csv' INTO TABLE WaterHeater FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n' IGNORE 1 ROWS;
LOAD DATA INFILE '/var/lib/mysql-files/AirHandler.csv' INTO TABLE AirHandler FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n' IGNORE 1 ROWS;
LOAD DATA INFILE '/var/lib/mysql-files/Heater.csv' INTO TABLE Heater FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n' IGNORE 1 ROWS;
LOAD DATA INFILE '/var/lib/mysql-files/HeatPump.csv' INTO TABLE HeatPump FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n' IGNORE 1 ROWS;
LOAD DATA INFILE '/var/lib/mysql-files/AirConditioner.csv' INTO TABLE AirConditioner FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n' IGNORE 1 ROWS;
LOAD DATA INFILE '/var/lib/mysql-files/Household-Public_Utilities.csv' INTO TABLE `Household-public_utilities` FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n' IGNORE 1 ROWS;