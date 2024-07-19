report_sql = {
    "top_twenty_five_manufacturers":
"""
SELECT manufacturer_name, 
COUNT(*) AS appliance_count
FROM Appliance
GROUP BY manufacturer_name
ORDER BY COUNT(manufacturer_name) DESC
LIMIT 25;
""",

    "manufacturer_appliance_count_by_type":
"""
SELECT SUM(CASE WHEN IFNULL(ac.order_entered, 0) = 0 THEN 0 ELSE 1 END) AS air_conditioner_count, 
	   SUM(CASE WHEN IFNULL(h.order_entered, 0) = 0 THEN 0 ELSE 1 END) AS heater_count, 
	   SUM(CASE WHEN IFNULL(hp.order_entered, 0) = 0 THEN 0 ELSE 1 END) AS heat_pump_count,
	   SUM(CASE WHEN IFNULL(wh.order_entered, 0) = 0 THEN 0 ELSE 1 END) AS water_heater_count,
     SUM(CASE WHEN IFNULL(ah.order_entered, 0) = 0 THEN 0 ELSE 1 END) AS air_handler_count
FROM Appliance a
LEFT JOIN AirConditioner ac ON a.email = ac.email AND a.order_entered = ac.order_entered
LEFT JOIN Heater h ON a.email = h.email AND a.order_entered = h.order_entered
LEFT JOIN HeatPump hp ON a.email = hp.email AND a.order_entered = hp.order_entered
LEFT JOIN WaterHeater wh ON a.email = wh.email AND a.order_entered = wh.order_entered
LEFT JOIN AirHandler ah ON a.email = ah.email AND a.order_entered = ah.order_entered
WHERE REPLACE(a.manufacturer_name, '\r','') = %s;
""",

    "manufacturer_model_search":
"""
SELECT DISTINCT  m.manufacturer_name, 
                 a.model_name,
                 CASE WHEN LOWER(m.manufacturer_name) LIKE CONCAT('%', LOWER(%s), '%')
                 and LOWER(model_name) LIKE CONCAT('%', LOWER(%s), '%') THEN 'Both'
                 WHEN LOWER(m.manufacturer_name) LIKE CONCAT('%', LOWER(%s), '%') THEN 'Manufacturer'
                 WHEN LOWER(model_name) LIKE CONCAT('%', LOWER(%s), '%') THEN 'Model'
                 ELSE 'None'
                 END AS matching_type
FROM Manufacturer m
INNER JOIN Appliance a ON a.manufacturer_name = m.manufacturer_name
WHERE LOWER(m.manufacturer_name) LIKE  CONCAT('%', LOWER(%s), '%') OR 
  LOWER(Model_Name) LIKE CONCAT('%', LOWER(%s), '%')
ORDER BY m.manufacturer_name, a.model_name ASC;
""",

    "heating_cooling_method_ac":
"""
SELECT hh.household_type,
  COUNT(ac.email) AS 'count',
  ROUND(AVG(ap.btu_rating)) AS avg_btu,
  ROUND(AVG(ac.energy_efficiency_ratio),1) AS avg_eer
FROM AirConditioner ac
INNER JOIN Appliance ap ON ap.email = ac.email AND ap.order_entered = ac.order_entered
INNER JOIN Household hh ON hh.email = ac.email
GROUP BY hh.household_type;
""",

    "heating_cooling_method_heater":
"""
SELECT 
  hh.household_type, 
  COUNT(ht.email) AS 'count', 
  ROUND(AVG(ap.btu_rating)) AS 'avg_btu', 
  (
    SELECT energy_source 
    FROM (
      SELECT 
        energy_source, 
        COUNT(*) AS energy_source_count
      FROM 
        Heater h
        INNER JOIN Household ho ON h.email = ho.email
      WHERE 
        ho.household_type = hh.household_type
      GROUP BY 
        energy_source
      ORDER BY 
        energy_source_count DESC
      LIMIT 
        1
    ) AS es
  ) AS most_common_energy_source
FROM 
  Heater ht
  INNER JOIN Appliance ap ON ap.email = ht.email AND ap.order_entered = ht.order_entered
  INNER JOIN Household hh ON hh.email = ht.email
GROUP BY 
  hh.household_type;
""",

    "heating_cooling_method_heat_pump":
"""
SELECT hh.household_type, COUNT(hp.email) AS count, 
        ROUND(AVG(ap.btu_rating)) AS avg_btu, 
        ROUND(AVG(hp.seasonal_energy_efficiency_rating),1) AS avg_seer, 
        ROUND(AVG(hp.heating_seasonal_performance_factor),1) AS avg_hspf
    FROM HeatPump hp
    INNER JOIN Appliance ap ON ap.email = hp.email AND ap.order_entered = hp.order_entered
    INNER JOIN Household hh ON hh.email = hp.email
    GROUP BY hh.household_type
""",

    "water_heater_statistics_by_states":
"""
SELECT lo.state AS state,
    COUNT(wh.email) AS water_heater_count,
    ROUND(AVG(IFNULL(wh.capacity, 0))) AS avg_water_heater_capacity,
    ROUND(AVG(IFNULL(ap.btu_rating, 0))) AS avg_water_heater_btu,
    CASE WHEN COUNT(wh.email) = 0 THEN NULL ELSE ROUND(AVG(IFNULL(wh.current_temperature_setting, 0)),1) END AS avg_temperature_setting,
    SUM(CASE WHEN wh.current_temperature_setting IS NOT NULL THEN 1 ELSE 0 END) AS provided_ts_count,
    SUM(CASE WHEN wh.email IS NOT NULL AND wh.current_temperature_setting IS NULL THEN 1 ELSE 0 END) AS not_provided_ts_count
FROM Location lo
LEFT JOIN Household hh ON hh.postal_code = lo.postal_code
LEFT JOIN WaterHeater wh ON wh.email = hh.email
LEFT JOIN Appliance ap ON ap.email = wh.email AND ap.order_entered = wh.order_entered
GROUP BY lo.state;
""",
    "water_heater_statistics_drilldown":
"""
SELECT TRIM(wh.energy_source) AS energy_source,
    ROUND(MIN(wh.capacity)) AS 'min_wh_capacity',
    ROUND(AVG(wh.capacity)) AS 'avg_wh_capacity', 
    ROUND(MAX(wh.capacity)) AS 'max_wh_capacity',
    CAST(ROUND(MIN(wh.current_temperature_setting),1) AS DECIMAL(10,1)) AS 'min_temperature_setting',
    CAST(ROUND(AVG(wh.current_temperature_setting),1) AS DECIMAL(10,1)) AS 'avg_temperature_setting',
    CAST(ROUND(MAX(wh.current_temperature_setting),1) AS DECIMAL(10,1)) AS 'max_temperature_setting'
FROM Location lo
INNER JOIN Household hh ON hh.postal_code = lo.postal_code
INNER JOIN WaterHeater wh ON wh.email = hh.email
WHERE lo.state = %s
GROUP BY wh.energy_source
ORDER BY wh.energy_source ASC;
""",

    "off_the_grid_dashboard_state":
"""
SELECT l.state, COUNT(*) household_count
FROM Household h
  INNER JOIN Location l ON l.postal_code = h.postal_code
  INNER JOIN `Household-public_utilities` hpu ON hpu.email = h.email
WHERE public_utility = 'off-the-grid'
GROUP BY l.state
ORDER BY household_count DESC
LIMIT 1;  
""",

    "off_the_grid_dashboard_avg_storage_capacity":
"""
SELECT round(avg(ifnull(storage,0))) AS  avg_off_grid_storage_kWh from (
SELECT hpu.email, Sum(ifnull(pg.storage_kWh,0)) storage
FROM `Household-public_utilities` hpu
INNER JOIN PowerGenerator pg ON pg.email = hpu.email
WHERE hpu.public_utility = 'off-the-grid'
group by hpu.email) a ;
""",

    "off_the_grid_dashboard_power_generation_type":
"""
SELECT
  ROUND(COUNT(CASE WHEN solar > 0 AND wind = 0 THEN email END) * 100.0 / SUM(COUNT(*)) OVER(), 1) solar_only,
  ROUND(COUNT(CASE WHEN wind > 0 AND solar = 0 THEN email END) * 100.0 / SUM(COUNT(*)) OVER(), 1) wind_only,
  ROUND(COUNT(CASE WHEN solar > 0 AND wind > 0 THEN email END) * 100.0 / SUM(COUNT(*)) OVER(), 1) mixed
FROM (
  SELECT
    pg.email,
    COUNT(CASE WHEN pg.power_generation_type = 'solar-electric' THEN 1 END) solar,
    COUNT(CASE WHEN pg.power_generation_type = 'wind' THEN 1 END) wind
  FROM `Household-public_utilities` hpu
    INNER JOIN PowerGenerator pg ON pg.email = hpu.email
  WHERE hpu.public_utility = 'off-the-grid'
  GROUP BY pg.email) pgc;
""",

    "off_the_grid_dashboard_on_or_off_grid":
"""
SELECT on_or_off_grid, ROUND(AVG(wh.capacity), 1) avg_capacity
FROM
  (SELECT 
   DISTINCT email,
   CASE
     WHEN public_utility = 'off-the-grid'
     THEN 'off-the-grid'
     ELSE 'on-the-grid'
   END AS on_or_off_grid
   FROM `Household-public_utilities`) hpu
   INNER JOIN WaterHeater wh ON wh.email = hpu.email
GROUP BY on_or_off_grid;
""",

    "off_the_grid_dashboard_btu":
"""
SELECT
  appliance_type,
  ROUND(MIN(apt.btu_rating)) min_btu,
  ROUND(AVG(apt.btu_rating)) avg_btu,
  ROUND(MAX(apt.btu_rating)) max_btu
FROM (
  SELECT "WaterHeater" appliance_type, a.email, a.BTU_rating
  FROM Appliance a NATURAL JOIN WaterHeater wh
  UNION ALL
  SELECT "AirHandler" appliance_type, a.email, a.BTU_rating
  FROM Appliance a NATURAL JOIN AirHandler ah
  UNION ALL
  SELECT "AirConditioner" appliance_type, a.email, a.BTU_rating
  FROM Appliance a NATURAL JOIN AirConditioner ac
  UNION ALL
  SELECT "Heater" appliance_type, a.email, a.BTU_rating
  FROM Appliance a NATURAL JOIN Heater ht
  UNION ALL
  SELECT "HeatPump" appliance_type, a.email, a.BTU_rating
  FROM Appliance a NATURAL JOIN HeatPump hp) apt
  NATURAL JOIN (
  SELECT email, public_utility
  FROM `Household-public_utilities`
  WHERE public_utility = 'off-the-grid') hpu
GROUP BY appliance_type;
""",

    "household_averages_by_radius":
"""
WITH MyCoordinates AS (
    SELECT latitude, longitude
    FROM `Location`
    WHERE postal_code = %s
), ValidPostalCodes AS (
    SELECT postal_code
    FROM `Location` l, MyCoordinates
    WHERE (3958.75 *
    (2 * ATAN2(
        SQRT(
        POWER(SIN((RADIANS(l.latitude) - RADIANS(MyCoordinates.latitude)) / 2), 2)
        + COS(RADIANS(MyCoordinates.latitude))
        * COS(RADIANS(l.latitude))
        * POWER(SIN(RADIANS(l.longitude)- RADIANS(MyCoordinates.longitude)) / 2, 2)),
        SQRT(1
        - POWER(SIN((RADIANS(l.latitude) - RADIANS(MyCoordinates.latitude)) / 2), 2)
        + COS(RADIANS(MyCoordinates.latitude))
        * COS(RADIANS(l.latitude))
        * POWER(SIN(RADIANS(l.longitude) - RADIANS(MyCoordinates.longitude)) / 2, 2)))
    )) <= %s)
SELECT
    COUNT(email) household_count,
    SUM(CASE WHEN household_type = 'house'
        THEN 1 ELSE 0 END) house_type_count,
    SUM(CASE WHEN household_type = 'apartment'
        THEN 1 ELSE 0 END) apartment_type_count,
    SUM(CASE WHEN household_type = 'townhome'
        THEN 1 ELSE 0 END) townhome_type_count,
    SUM(CASE WHEN household_type = 'condominium'
        THEN 1 ELSE 0 END) condominium_type_count,
    SUM(CASE WHEN household_type = 'mobile home'
        THEN 1 ELSE 0 END) mobile_home_type_count,
    ROUND(AVG(square_footage)) avg_square_footage,
    ROUND(AVG(thermostat_setting_heating), 1) avg_thermostat_heating,
    ROUND(AVG(thermostat_setting_cooling), 1) avg_thermostat_cooling,
    (WITH MyCoordinates AS (
        SELECT latitude, longitude
        FROM `Location`
        WHERE postal_code = %s
	    ),  ValidPostalCodes AS (
        SELECT postal_code
        FROM `Location` l, MyCoordinates
        WHERE (3958.75 *
        (2 * ATAN2(
            SQRT(
            POWER(SIN((RADIANS(l.latitude) - RADIANS(MyCoordinates.latitude)) / 2), 2)
            + COS(RADIANS(MyCoordinates.latitude))
            * COS(RADIANS(l.latitude))
            * POWER(SIN(RADIANS(l.longitude)- RADIANS(MyCoordinates.longitude)) / 2, 2)),
            SQRT(1
            - POWER(SIN((RADIANS(l.latitude) - RADIANS(MyCoordinates.latitude)) / 2), 2)
            + COS(RADIANS(MyCoordinates.latitude))
            * COS(RADIANS(l.latitude))
            * POWER(SIN(RADIANS(l.longitude) - RADIANS(MyCoordinates.longitude)) / 2, 2)))
        )) <= %s)
        SELECT GROUP_CONCAT(DISTINCT hpu.public_utility SEPARATOR ', ')
        FROM Household h NATURAL LEFT OUTER JOIN `Household-public_utilities` hpu
        WHERE public_utility != 'off-the-grid' AND
        h.postal_code IN (TABLE ValidPostalCodes)) public_utilities_used,
  COUNT(CASE WHEN public_utilities = 'off-the-grid' THEN 1 END) off_the_grid_count,
  COUNT(CASE WHEN pg_count > 0 THEN 1 END) homes_with_pg,
  CASE WHEN solar_count = 0 AND wind_count = 0 THEN NULL
    WHEN SUM(solar_count) = SUM(wind_count) THEN "solar-electrinc and wind"
    WHEN SUM(solar_count) > SUM(wind_count) THEN "solar-electric"
    ELSE "wind" END most_common_pg,
  ROUND((SUM(total_monthly_kWh) / SUM(pg_count))) avg_monthly_kWh,
  COUNT(CASE WHEN battery_count > 0 THEN 1 END) homes_with_battery
FROM (
  SELECT
    email,
    household_type,
    square_footage,
    thermostat_setting_heating,
    thermostat_setting_cooling,
    public_utilities,
    COUNT(CASE WHEN power_generation_type = 'solar-electric' THEN email END) solar_count,
    COUNT(CASE WHEN power_generation_type = 'wind' THEN email END) wind_count,
    COUNT(power_generation_type) pg_count,
    SUM(monthly_kWh) total_monthly_kWh,
    COUNT(CASE WHEN storage_kWh IS NOT NULL THEN 1 END) battery_count
  FROM Household h
    NATURAL LEFT OUTER JOIN PowerGenerator pg
    NATURAL LEFT OUTER JOIN (
      SELECT
        hpu.email,
        GROUP_CONCAT(DISTINCT hpu.public_utility SEPARATOR ', ') public_utilities
      FROM `Household-public_utilities` hpu
      GROUP BY hpu.email) hpulist
  WHERE h.postal_code IN (TABLE ValidPostalCodes)
  GROUP BY email) hr;
"""
}
  
  
  