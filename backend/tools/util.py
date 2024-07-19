import logging
import re


# Utilities
def parse_sql(filename):
    data = open(filename, "r").readlines()
    stmts = []
    DELIMITER = ";"
    stmt = ""

    for lineno, line in enumerate(data):
        if not line.strip():
            continue

        if line.startswith("--"):
            continue

        if "DELIMITER" in line:
            DELIMITER = line.split()[1]
            continue

        if DELIMITER not in line:
            stmt += line.replace(DELIMITER, ";")
            continue

        if stmt:
            stmt += line
            stmts.append(stmt.strip())
            stmt = ""
        else:
            stmts.append(line.strip())
    return stmts


def init_logger():
    # Set up the logger
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    logging.basicConfig(format=log_format, level=logging.NOTSET)
    logger = logging.getLogger()
    return logger


def email_validator(email):
    regex = re.compile(r"^[a-z0-9]+[\._]?[a-z0-9]+[@]\w+[.]\w{2,3}$")
    if re.match(regex, email):
        return True
    else:
        return False


def report_switcher(report_id):
    switcher = {
        1: "SELECT manufacturer_name, COUNT(*) AS Appliance_Count"
        " FROM Appliance"
        " GROUP BY manufacturer_name"
        " ORDER BY COUNT(manufacturer_name) DESC"
        " LIMIT 25;",
        2: "SELECT"
        " hh.household_type,"
        " COUNT(ht.email) AS 'Heater Count',"
        " ROUND(AVG(ap.btu_rating)) AS 'AVG HEATER BTU',"
        " ("
        " SELECT energy_source"
        " FROM ("
        " SELECT"
        " energy_source,"
        " COUNT(*) AS energy_source_count"
        " FROM"
        " Heater h"
        " INNER JOIN Household ho ON h.email = ho.email"
        " WHERE"
        " ho.household_type = hh.household_type"
        " GROUP BY"
        " energy_source"
        " ORDER BY"
        " energy_source_count DESC"
        " LIMIT"
        " 1"
        " ) AS es"
        " ) AS 'Most Common Energy Source'"
        " FROM"
        " Heater ht"
        " INNER JOIN Appliance ap ON ap.email = ht.email AND ap.order_entered = ht.order_entered"
        " INNER JOIN Household hh ON hh.email = ht.email"
        " GROUP BY"
        " hh.household_type;",
        3: "SELECT"
        " hh.household_type,"
        " COUNT(ht.email) AS 'Heater Count',"
        " ROUND(AVG(ap.btu_rating)) AS 'AVG HEATER BTU',"
        " ("
        " SELECT energy_source"
        " FROM ("
        " SELECT"
        " energy_source,"
        " COUNT(*) AS energy_source_count"
        " FROM"
        " Heater h"
        " INNER JOIN Household ho ON h.email = ho.email"
        " WHERE"
        " ho.household_type = hh.household_type"
        " GROUP BY"
        " energy_source"
        " ORDER BY"
        " energy_source_count DESC"
        " LIMIT"
        " 1"
        " ) AS es"
        " ) AS 'Most Common Energy Source'"
        " FROM"
        " Heater ht"
        " INNER JOIN Appliance ap ON ap.email = ht.email AND ap.order_entered = ht.order_entered"
        " INNER JOIN Household hh ON hh.email = ht.email"
        " GROUP BY"
        " hh.household_type;",
        4: " SELECT lo.state AS state,"
        " COUNT(wh.email) AS water_heater_count,"
        " ROUND(AVG(IFNULL(wh.capacity, 0))) AS avg_water_heater_capacity,"
        " ROUND(AVG(IFNULL(ap.btu_rating, 0))) AS avg_water_heater_btu,"
        " ROUND(AVG(IFNULL(wh.current_temperature_setting, 0)),1) AS avg_temperature_setting,"
        " SUM(CASE WHEN wh.current_temperature_setting IS NOT NULL THEN 1 ELSE 0 END) AS provided_ts_count,"
        " SUM(CASE WHEN wh.email IS NOT NULL AND wh.current_temperature_setting IS NULL THEN 1 ELSE 0 END) AS not_provided_ts_count"
        " FROM Location lo"
        " LEFT JOIN Household hh ON hh.postal_code = lo.postal_code"
        " LEFT JOIN WaterHeater wh ON wh.email = hh.email"
        " LEFT JOIN Appliance ap ON ap.email = wh.email AND ap.order_entered = wh.order_entered"
        " GROUP BY lo.state;",
        5: "SELECT TRIM(wh.energy_source) AS energy_source,"
        " ROUND(MIN(wh.capacity)) AS 'min_wh_capacity',"
        " ROUND(AVG(wh.capacity)) AS 'avg_wh_capacity'," 
        " ROUND(MAX(wh.capacity)) AS 'max_wh_capacity'," 
        " MIN(wh.current_temperature_setting) AS 'min_temperature_setting'," 
        " AVG(wh.current_temperature_setting) AS 'avg_temperature_setting'," 
        " ROUND(MAX(wh.current_temperature_setting),1) AS 'max_temperature_setting'"
        " FROM Location lo"
        " INNER JOIN Household hh ON hh.postal_code = lo.postal_code"
        " INNER JOIN WaterHeater wh ON wh.email = hh.email"
        " WHERE lo.state = %s"
        " GROUP BY wh.energy_source"
        " ORDER BY wh.energy_source ASC;",
        6: "SELECT SUM(CASE WHEN IFNULL(ac.order_entered, 0) = 0 THEN 0 ELSE 1 END) AS AirConditionerCount,"
        " SUM(CASE WHEN IFNULL(h.order_entered, 0) = 0 THEN 0 ELSE 1 END) AS HeaterCount,"
        " SUM(CASE WHEN IFNULL(hp.order_entered, 0) = 0 THEN 0 ELSE 1 END) AS HeatPumpCount,"
        " SUM(CASE WHEN IFNULL(wh.order_entered, 0) = 0 THEN 0 ELSE 1 END) AS WaterHeaterCount,"
        " SUM(CASE WHEN IFNULL(ah.order_entered, 0) = 0 THEN 0 ELSE 1 END) AS AirHandlerCount"
        " FROM Appliance a"
        " LEFT JOIN AirConditioner ac ON a.email = ac.email AND a.order_entered = ac.order_entered"
        " LEFT JOIN Heater h ON a.email = h.email AND a.order_entered = h.order_entered"
        " LEFT JOIN HeatPump hp ON a.email = hp.email AND a.order_entered = hp.order_entered"
        " LEFT JOIN WaterHeater wh ON a.email = wh.email AND a.order_entered = wh.order_entered"
        " LEFT JOIN AirHandler ah ON a.email = ah.email AND a.order_entered = ah.order_entered"
        " WHERE a.manufacturer_name = %s;",
        7: [
            "SELECT l.state, COUNT(*) household_count"
            " FROM Household h"
            " INNER JOIN Location l ON l.postal_code = h.postal_code"
            " INNER JOIN `Household-public_utilities` hpu ON hpu.email = h.email"
            " WHERE public_utility = 'off-the-grid'"
            " GROUP BY l.state"
            " ORDER BY household_count DESC"
            " LIMIT 1;",
            "SELECT round(avg(ifnull(storage,0))) AS  avg_off_grid_storage_kWh from ("
            " SELECT hpu.email, Sum(ifnull(pg.storage_kWh,0)) storage"
            " FROM `Household-public_utilities` hpu"
            " INNER JOIN PowerGenerator pg ON pg.email = hpu.email"
            " WHERE hpu.public_utility = 'off-the-grid'"
            " group by hpu.email) a ;",
            "SELECT"
            " ROUND(COUNT(CASE WHEN solar > 0 AND wind = 0 THEN email END) * 100.0 / SUM(COUNT(*)) OVER(), 1) solar_only,"
            " ROUND(COUNT(CASE WHEN wind > 0 AND solar = 0 THEN email END) * 100.0 / SUM(COUNT(*)) OVER(), 1) wind_only,"
            " ROUND(COUNT(CASE WHEN solar > 0 AND wind > 0 THEN email END) * 100.0 / SUM(COUNT(*)) OVER(), 1) mixed"
            " FROM ("
            " SELECT"
            " pg.email,"
            " COUNT(CASE WHEN pg.power_generation_type = 'solar-electric' THEN 1 END) solar,"
            " COUNT(CASE WHEN pg.power_generation_type = 'wind' THEN 1 END) wind"
            " FROM `Household-public_utilities` hpu"
            " INNER JOIN PowerGenerator pg ON pg.email = hpu.email"
            " WHERE hpu.public_utility = 'off-the-grid'"
            " GROUP BY pg.email) pgc;",
            "SELECT on_or_off_grid, ROUND(AVG(wh.capacity), 1)"
            " FROM"
            " (SELECT"
            " DISTINCT email,"
            " CASE"
            " WHEN public_utility = 'off-the-grid'"
            " THEN 'off-the-grid'"
            " ELSE 'on-the-grid'"
            " END AS on_or_off_grid"
            " FROM `Household-public_utilities`) hpu"
            " INNER JOIN WaterHeater wh ON wh.email = hpu.email"
            " GROUP BY on_or_off_grid;",
            "SELECT"
            " appliance_type,"
            " ROUND(MIN(apt.btu_rating)) min_btu,"
            " ROUND(AVG(apt.btu_rating)) avg_btu,"
            " ROUND(MAX(apt.btu_rating)) max_btu"
            " FROM ("
            " SELECT 'WaterHeater' appliance_type, a.email, a.BTU_rating"
            " FROM Appliance a NATURAL JOIN WaterHeater wh"
            " UNION ALL"
            " SELECT 'AirHandler' appliance_type, a.email, a.BTU_rating"
            " FROM Appliance a NATURAL JOIN AirHandler ah"
            " UNION ALL"
            " SELECT 'AirConditioner' appliance_type, a.email, a.BTU_rating"
            " FROM Appliance a NATURAL JOIN AirConditioner ac"
            " UNION ALL"
            " SELECT 'Heater' appliance_type, a.email, a.BTU_rating"
            " FROM Appliance a NATURAL JOIN Heater ht"
            " UNION ALL"
            " SELECT 'HeatPump' appliance_type, a.email, a.BTU_rating"
            " FROM Appliance a NATURAL JOIN HeatPump hp) apt"
            " NATURAL JOIN ("
            " SELECT email, public_utility"
            " FROM `Household-public_utilities`"
            " WHERE public_utility = 'off-the-grid') hpu"
            " GROUP BY appliance_type;",
        ],
        8: "SELECT"
        " COUNT(email) household_count,"
        " SUM(CASE WHEN household_type = 'house'"
        "   THEN 1 ELSE 0 END) house_type_count,"
        " SUM(CASE WHEN household_type = 'apartment'"
        " THEN 1 ELSE 0 END) apartment_type_count,"
        " SUM(CASE WHEN household_type = 'townhome'"
        "   THEN 1 ELSE 0 END) townhome_type_count,"
        " SUM(CASE WHEN household_type = 'condominium'"
        "    THEN 1 ELSE 0 END) condominium_type_count,"
        " SUM(CASE WHEN household_type = 'mobile home'"
        "   THEN 1 ELSE 0 END) mobile_home_type_count,"
        " ROUND(AVG(square_footage)) avg_square_footage,"
        " ROUND(AVG(thermostat_setting_heating), 1) avg_thermostat_heating,"
        " ROUND(AVG(thermostat_setting_cooling), 1) avg_thermostat_cooling,"
        " (SELECT GROUP_CONCAT(DISTINCT hpu.public_utility SEPARATOR ', ')"
        " FROM Household h NATURAL LEFT OUTER JOIN `Household-public_utilities` hpu"
        " WHERE public_utility != 'off-the-grid' AND"
        " h.postal_code IN ("
        " SELECT postal_code"
        " FROM Location"
        " WHERE 3958.75 *"
        " (2 * ATAN2("
        " SQRT("
        " POWER(SIN((RADIANS(latitude) - RADIANS(42.192384000000000)) / 2), 2)"
        "  + COS(RADIANS(42.192384000000000))"
        " * COS(RADIANS(latitude))"
        "     * POWER(SIN(RADIANS(longitude)- RADIANS(-78.143080000000000)) / 2, 2)),"
        "  SQRT(1"
        "  - POWER(SIN((RADIANS(latitude) - RADIANS(42.192384000000000)) / 2), 2)"
        " + COS(RADIANS(42.192384000000000))"
        " * COS(RADIANS(latitude))"
        " * POWER(SIN(RADIANS(longitude) - RADIANS(-78.143080000000000)) / 2, 2)))"
        " ) < 100)) public_utilities_used,"
        " COUNT(CASE WHEN public_utilities = 'off-the-grid' THEN 1 END) off_the_grid_count,"
        " COUNT(CASE WHEN pg_count > 0 THEN 1 END) homes_with_pg,"
        " CASE WHEN SUM(solar_count) > SUM(wind_count) THEN 'solar-electric' ELSE 'wind' END most_common_pg,"
        " ROUND((SUM(total_monthly_kWh) / SUM(pg_count))) avg_monthly_kWh,"
        " COUNT(CASE WHEN battery_count > 0 THEN 1 END) homes_with_battery"
        " FROM ("
        " SELECT"
        " email,"
        " household_type,"
        " square_footage,"
        " thermostat_setting_heating,"
        " thermostat_setting_cooling,"
        " public_utilities,"
        " COUNT(CASE WHEN power_generation_type = 'solar-electric' THEN email END) solar_count,"
        " COUNT(CASE WHEN power_generation_type = 'wind' THEN email END) wind_count,"
        " COUNT(power_generation_type) pg_count,"
        " SUM(monthly_kWh) total_monthly_kWh,"
        " COUNT(CASE WHEN storage_kWh IS NOT NULL THEN 1 END) battery_count"
        " FROM Household h"
        " NATURAL LEFT OUTER JOIN PowerGenerator pg"
        " NATURAL LEFT OUTER JOIN ("
        " SELECT"
        " hpu.email,"
        " GROUP_CONCAT(DISTINCT hpu.public_utility SEPARATOR ', ') public_utilities"
        " FROM `Household-public_utilities` hpu"
        " GROUP BY hpu.email) hpulist"
        " WHERE h.postal_code IN ("
        " SELECT postal_code"
        " FROM Location"
        " WHERE 3958.75 *"
        "  (2 * ATAN2("
        "  SQRT("
        "    POWER(SIN((RADIANS(latitude) - RADIANS(42.192384000000000)) / 2), 2)"
        "   + COS(RADIANS(42.192384000000000))"
        "  * COS(RADIANS(latitude))"
        " * POWER(SIN(RADIANS(longitude)- RADIANS(-78.143080000000000)) / 2, 2)),"
        " SQRT(1"
        "  - POWER(SIN((RADIANS(latitude) - RADIANS(42.192384000000000)) / 2), 2)"
        "  + COS(RADIANS(42.192384000000000))"
        " * COS(RADIANS(latitude))"
        " * POWER(SIN(RADIANS(longitude) - RADIANS(-78.143080000000000)) / 2, 2)))"
        " ) < 100)"
        " GROUP BY email) hr;",
        9: """
            SELECT DISTINCT apt.appliance_type, apt.order_entered, apt.manufacturer_name, apt.model_name
            FROM 
                ( SELECT "WaterHeater" appliance_type, a.order_entered, a.manufacturer_name, a.model_name, a.email
                    FROM Appliance a NATURAL JOIN WaterHeater wh
                    UNION ALL
                    SELECT "AirHandler" appliance_type, a.order_entered, a.manufacturer_name, a.model_name, a.email
                    FROM Appliance a NATURAL JOIN AirHandler ah 
                ) apt
                NATURAL JOIN ( 
                    SELECT email
                    FROM Appliance
                    WHERE email = %s
                ) hpu
            ORDER BY appliance_type ASC;
           """,
    }

    return switcher.get(report_id)


def appliance_switcher(appliance):
    if appliance["appliance_type"] == "AirHandler":
        selector = ", ".join(appliance["methods"])
    else:
        selector = appliance["appliance_type"]

    switcher = {
        "AirConditioner": [
            "INSERT INTO `Appliance` (email, order_entered, btu_rating, model_name, manufacturer_name) VALUES (%s, %s, %s, %s, %s);",
            "INSERT INTO `AirHandler` (email, order_entered) VALUES (%s, %s);",
            "INSERT INTO `AirConditioner` (email, order_entered,energy_efficiency_ratio) VALUES (%s, %s, %s);",
        ],
        "Heater": [
            "INSERT INTO `Appliance` (email, order_entered, btu_rating, model_name, manufacturer_name) VALUES (%s, %s, %s, %s, %s);",
            "INSERT INTO `AirHandler` (email, order_entered) VALUES (%s, %s);",
            "INSERT INTO `Heater` (email, order_entered, energy_source) VALUES (%s, %s, %s);",
        ],
        "HeatPump": [
            "INSERT INTO `Appliance` (email, order_entered, btu_rating, model_name, manufacturer_name) VALUES (%s, %s, %s, %s, %s);",
            "INSERT INTO `AirHandler` (email, order_entered) VALUES (%s, %s);",
            "INSERT INTO `HeatPump` (email, order_entered, heating_seasonal_performance_factor, seasonal_energy_efficiency_rating) VALUES (%s, %s, %s, %s);",
        ],
        "AirConditioner, Heater": [
            "INSERT INTO `Appliance` (email, order_entered, btu_rating, model_name, manufacturer_name) VALUES (%s, %s, %s, %s, %s);",
            "INSERT INTO `AirHandler` (email, order_entered) VALUES (%s, %s);",
            "INSERT INTO `AirConditioner` (email, order_entered, energy_efficiency_ratio) VALUES (%s, %s, %s);",
            "INSERT INTO `Heater` (email, order_entered, energy_source) VALUES (%s, %s, %s);",
        ],
        "AirConditioner, HeatPump": [
            "INSERT INTO `Appliance` (email, order_entered, btu_rating, model_name, manufacturer_name) VALUES (%s, %s, %s, %s, %s);",
            "INSERT INTO `AirHandler` (email, order_entered) VALUES (%s, %s);",
            "INSERT INTO `AirConditioner` (email, order_entered, energy_efficiency_ratio) VALUES (%s, %s, %s);",
            "INSERT INTO `HeatPump` (email, order_entered, heating_seasonal_performance_factor, seasonal_energy_efficiency_rating) VALUES (%s, %s, %s, %s);",
        ],
        "Heater, HeatPump": [
            "INSERT INTO `Appliance` (email, order_entered, btu_rating, model_name, manufacturer_name) VALUES (%s, %s, %s, %s, %s);",
            "INSERT INTO `AirHandler` (email, order_entered) VALUES (%s, %s);",
            "INSERT INTO `Heater` (email, order_entered, energy_source) VALUES (%s, %s, %s);",
            "INSERT INTO `HeatPump` (email, order_entered, heating_seasonal_performance_factor, seasonal_energy_efficiency_rating) VALUES (%s, %s, %s, %s);",
        ],
        "AirConditioner, Heater, HeatPump": [
            "INSERT INTO `Appliance` (email, order_entered, btu_rating, model_name, manufacturer_name) VALUES (%s, %s, %s, %s, %s);",
            "INSERT INTO `AirHandler` (email, order_entered) VALUES (%s, %s);",
            "INSERT INTO `AirConditioner` (email, order_entered, energy_efficiency_ratio) VALUES (%s, %s, %s);",
            "INSERT INTO `Heater` (email, order_entered, energy_source) VALUES (%s, %s, %s);",
            "INSERT INTO `HeatPump` (email, order_entered, heating_seasonal_performance_factor, seasonal_energy_efficiency_rating) VALUES (%s, %s, %s, %s);",
        ],
        "WaterHeater": [
            "INSERT INTO `Appliance` (email, order_entered, btu_rating, model_name, manufacturer_name) VALUES (%s, %s, %s, %s, %s);",
            "INSERT INTO `WaterHeater` (email, order_entered, capacity, current_temperature_setting, energy_source) VALUES (%s, %s, %s, %s, %s);",
        ],
    }

    return switcher.get(selector)


def get_params(statement, appliance):
    start = statement.index("(") + 1
    end = statement.index(")")

    attributes = statement[start:end]
    arguments = attributes.split(",")

    values = []
    for arg in arguments:
        arg = arg.strip()
        values.append(appliance[arg])

    params = tuple(values)
    return params
