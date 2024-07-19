import pathlib
import mysql.connector
from configparser import ConfigParser
import tools.util as util
from flask import Response
import jsonpickle, json
import traceback
from decimal import Decimal

from sql.reports import report_sql

# Get the logger
logger = util.init_logger()

# Read configuration file
config_path = pathlib.Path(__file__).parent.absolute() / "../config/config.cfg"
config = ConfigParser()
config.read(config_path)

host = config["DB"]["Host"]
user = config["DB"]["User"]
port = config["DB"]["Port"]
password = config["DB"]["Password"]
database = config["DB"]["Name"]
auth_plugin = config["DB"]["Plugin"]


# Connect to the database
def connect():
    logger.info(f"Connecting to the {database} database....")
    config = {
        "user": user,
        "password": password,
        "host": host,
        "port": port,
        "database": database,
        "auth_plugin": auth_plugin,
    }
    connection = mysql.connector.connect(**config)
    logger.info(f"Successfully connected to {database}!")
    return connection


# Disconnect
def disconnect(connection, cursor):
    logger.info(f"Disconnecting from the {database} database....")
    if connection.is_connected():
        cursor.close()
        connection.close()
        logger.info(f"Successfully disconnected from {database}.")


# -----------------------------------------

def validate_postal_code(postal_code):
    try:
        connection = connect()
        cursor = connection.cursor(buffered=True)

        pc_exists_sql = "SELECT CASE WHEN EXISTS (SELECT * FROM Location l WHERE l.postal_code = %s) THEN 1 ELSE 0 END;"
        cursor.execute(pc_exists_sql, (postal_code,))
        connection.commit()

        pc_exists = cursor.fetchone()[0]
        disconnect(connection, cursor)

        pc_valid = pc_exists == 1

        response = {
            "postal_code": pc_valid
        }

        return Response(
            jsonpickle.encode(response), status=200, mimetype="application/json"
        )

    except Exception as e:
        logger.error(f"Error: {e}")
        traceback.print_exc()
        return Response(
            jsonpickle.encode(f"Error: {e}"), status=500, mimetype="application/json"
        )

def save_household(household):
    try:
        connection = connect()
        cursor = connection.cursor(buffered=True)

        # Create a new record
        if len(household) == 0:
            logger.warning("Invalid Household argument")
            return "Invalid Household argument"

        # Validation
        email_exists_sql = "SELECT CASE WHEN EXISTS (SELECT * FROM `Household` h WHERE h.email = %s) THEN 1 ELSE 0 END;"
        cursor.execute(email_exists_sql, (household["email"],))
        email_exists = cursor.fetchone()[0]
        email_valid = email_exists == 0

        pc_exists_sql = "SELECT CASE WHEN EXISTS (SELECT * FROM Location l WHERE l.postal_code = %s) THEN 1 ELSE 0 END;"
        cursor.execute(pc_exists_sql, (household["postal_code"],))
        pc_exists = cursor.fetchone()[0]
        pc_valid = pc_exists == 1

        # 200: received request, invalid email/postal
        # 201: received request, write succeeded
        # 500: received request, write failed

        # email: true = unique email
        # postal_code: true = postal code in database
        response = {"email": email_valid, "postal_code": pc_valid}

        if email_valid and pc_valid:
            # Insert a new household
            sql = "INSERT INTO `Household` (`email`, `square_footage`, `household_type`, `thermostat_setting_heating`, `thermostat_setting_cooling`, `postal_code`) VALUES (%s, %s, %s, %s, %s, %s)"
            cursor.execute(
                sql,
                (
                    household["email"],
                    household["square_footage"],
                    household["household_type"],
                    household["thermostat_setting_heating"],
                    household["thermostat_setting_cooling"],
                    household["postal_code"],
                ),
            )
            connection.commit()

            # Now insert the utilities
            for utility in household["public_utilities"]:
                sql = "INSERT INTO `Household-public_utilities` (email, public_utility) VALUES (%s, %s)"
                cursor.execute(sql, (household["email"], utility))
                connection.commit()

            disconnect(connection, cursor)
            return Response(
                jsonpickle.encode(response), status=201, mimetype="application/json"
            )

        if not email_valid:
            logger.info(f'Email already exists: {household["email"]}')

        if not pc_valid:
            logger.info(f'Postal Code does not exists: {household["postal_code"]}')

        return Response(
            jsonpickle.encode(response), status=200, mimetype="application/json"
        )

    except Exception as e:
        logger.error(f"Error: {e}")
        traceback.print_exc()
        return Response(
            jsonpickle.encode(f"Error: {e}"), status=500, mimetype="application/json"
        )


def list_manufacturers():
    try:
        connection = connect()
        cursor = connection.cursor(buffered=True)

        # Select all manufacturer
        sql = "SELECT manufacturer_name FROM Manufacturer"
        cursor.execute(sql)
        manufacturers = cursor.fetchall()
        logger.info(f"Listing {len(manufacturers)} manufacturers")
        disconnect(connection, cursor)

        response = {"result": list(map(lambda k: k[0], manufacturers))}
        return Response(
            jsonpickle.encode(response), status=200, mimetype="application/json"
        )

    except Exception as e:
        logger.error(f"Error: {e}")
        traceback.print_exc()
        return Response(
            jsonpickle.encode(f"Error: {e}"), status=500, mimetype="application/json"
        )


def list_households():
    try:
        connection = connect()
        cursor = connection.cursor(buffered=True)

        # Select all households
        sql = "SELECT * FROM Household"
        cursor.execute(sql)
        households = cursor.fetchall()
        logger.info(f"Listing {len(households)} households")
        disconnect(connection, cursor)
        response = {"result": households}
        return response

    except Exception as e:
        logger.error(f"Error: {e}")
        traceback.print_exc()
        return Response(
            jsonpickle.encode(f"Error: {e}"), status=500, mimetype="application/json"
        )


def list_appliances(list_request):
    try:
        connection = connect()
        cursor = connection.cursor(buffered=True, dictionary=True)

        # Extract the email value
        email = list_request["email"]

        # Select all appliances
        sql = util.report_switcher(9)
        cursor.execute(sql, (email,))
        appliances = cursor.fetchall()
        logger.info(f"Listing {len(appliances)} appliances for {email}")
        disconnect(connection, cursor)
        response = {"result": appliances}
        return Response(
            jsonpickle.encode(response), status=200, mimetype="application/json"
        )

    except Exception as e:
        logger.error(f"Error: {e}")
        traceback.print_exc()
        return Response(
            jsonpickle.encode(f"Error: {e}"), status=500, mimetype="application/json"
        )


def save_appliance(appliance):
    try:
        connection = connect()
        cursor = connection.cursor(buffered=True)

        # Create a new record
        if len(appliance) == 0:
            logger.warning("Invalid Appliance argument")
            return "Invalid Appliance argument"

        statements = util.appliance_switcher(appliance)
        for stm in statements:
            params = util.get_params(stm, appliance)
            cursor.execute(stm, params)
            connection.commit()

        disconnect(connection, cursor)
        response = {
            "result": f"Successfully saved appliance for email: {appliance['email']}"
        }
        return Response(
            jsonpickle.encode(response), status=201, mimetype="application/json"
        )
    except Exception as e:
        logger.error(f"Error: {e}")
        traceback.print_exc()
        return Response(
            jsonpickle.encode(f"Error: {e}"), status=500, mimetype="application/json"
        )


def delete_appliance(delete_request):
    try:
        connection = connect()
        cursor = connection.cursor(buffered=True)

        # Delete a record
        email = delete_request["email"]
        order_entered = delete_request["order_entered"]

        sql = "DELETE FROM `Appliance` WHERE email = %s AND order_entered = %s"
        cursor.execute(sql, (email, order_entered))
        connection.commit()
        disconnect(connection, cursor)
        response = {"result": f"Successfully deleted appliance for email: {email}"}
        return Response(
            jsonpickle.encode(response), status=201, mimetype="application/json"
        )
    except Exception as e:
        logger.error(f"Error: {e}")
        traceback.print_exc()
        return Response(
            jsonpickle.encode(f"Error: {e}"), status=500, mimetype="application/json"
        )


def save_power_generator(power_generator):
    try:
        connection = connect()
        cursor = connection.cursor(buffered=True)
        # Create a new record
        if len(power_generator) == 0:
            logger.warning("Invalid PowerGenerator argument")
            return "Invalid PowerGenerator argument"

        sql = "INSERT INTO `PowerGenerator` (email, order_entered, power_generation_type, monthly_kWh, storage_kWh) VALUES (%s, %s, %s, %s, %s)"
        cursor.execute(
            sql,
            (
                power_generator["email"],
                power_generator["order_entered"],
                power_generator["power_generation_type"],
                power_generator["monthly_kWh"],
                power_generator["storage_kWh"],
            ),
        )
        connection.commit()
        disconnect(connection, cursor)
        response = {
            "result": f'A new PowerGenerator record for email {power_generator["email"]} has been saved.'
        }
        return Response(
            jsonpickle.encode(response), status=201, mimetype="application/json"
        )
    except Exception as e:
        logger.error(f"Error: {e}")
        traceback.print_exc()
        return Response(
            jsonpickle.encode(f"Error: {e}"), status=500, mimetype="application/json"
        )


def list_power_generators(list_request):
    try:
        connection = connect()
        cursor = connection.cursor(buffered=True, dictionary=True)

        email = list_request["email"]

        # Select all power generators
        sql = "SELECT order_entered, power_generation_type, monthly_kWh, storage_kWh FROM `PowerGenerator` WHERE email = %s"
        cursor.execute(sql, (email,))
        power_generators = cursor.fetchall()
        logger.info(f"Listing {len(power_generators)} power generators")
        disconnect(connection, cursor)
        response = {"result": power_generators}
        return Response(
            jsonpickle.encode(response), status=200, mimetype="application/json"
        )
    except Exception as e:
        logger.error(f"Error: {e}")
        traceback.print_exc()
        return Response(
            jsonpickle.encode(f"Error: {e}"), status=500, mimetype="application/json"
        )


def delete_power_generator(delete_request):
    try:
        connection = connect()
        cursor = connection.cursor(buffered=True)

        # Delete a record
        email = delete_request["email"]
        order_entered = delete_request["order_entered"]

        sql = "DELETE FROM `PowerGenerator` WHERE email = %s AND order_entered = %s"
        cursor.execute(sql, (email, order_entered))
        connection.commit()
        disconnect(connection, cursor)
        response = {"result": f"Successfully deleted PowerGenerator for email: {email}"}
        return Response(
            jsonpickle.encode(response), status=201, mimetype="application/json"
        )
    except Exception as e:
        logger.error(f"Error: {e}")
        traceback.print_exc()
        return Response(
            jsonpickle.encode(f"Error: {e}"), status=500, mimetype="application/json"
        )


# --------------------------- REPORTS ------------------------------------ #


class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return str(obj)
        return super(DecimalEncoder, self).default(obj)


def get_report(report_id, parameter=None):
    try:
        connection = connect()
        cursor = connection.cursor(buffered=True)

        # Get the report query
        report_sql = util.report_switcher(report_id)

        off_grid_dashboard = [[]]

        if parameter == None:
            if report_id == 7:
                for sql in report_sql:
                    cursor.execute(sql)
            else:
                cursor.execute(report_sql)
        else:
            cursor.execute(report_sql, (parameter,))
        columns = [desc[0] for desc in cursor.description]
        records = cursor.fetchall()
        logger.info(f"This report contains {len(records)} records")
        disconnect(connection, cursor)
        # Convert records to dictionary format
        result = [dict(zip(columns, row)) for row in records]
        report = {"result": result}
        return Response(
            json.dumps(report, cls=DecimalEncoder),
            status=200,
            mimetype="application/json",
        )

    except Exception as e:
        logger.error(f"Error: {e}")
        traceback.print_exc()
        return Response(
            json.dumps({"error": str(e)}), status=500, mimetype="application/json"
        )


def get_sql(sql_name, parameters=None):
    try:
        connection = connect()
        cursor = connection.cursor(buffered=True, dictionary=True)
        sql = report_sql[sql_name]

        logger.info(f"Parameters: {parameters}")
        if parameters:
            cursor.execute(sql, parameters)
        else:
            cursor.execute(sql)

        connection.commit()
        logger.info(f"Executed query:\n{cursor.statement}")
        data = cursor.fetchall()
        disconnect(connection, cursor)

        logger.info(f"SQL {sql_name} contains {len(data)} records")
        return data

    except Exception as e:
        logger.error(f"Error: {e}")
        traceback.print_exc()
        return e


def get_single_query_report(name, parameters=None):
    """Receives a query_name and parameters, where parameters is a tuple"""
    data = get_sql(name, parameters)

    if isinstance(data, Exception):
        return Response(
            json.dumps({"error": str(data)}), status=500, mimetype="application/json"
        )

    return Response(
        json.dumps({"result": data}, default=str),
        status=200,
        mimetype="application/json",
    )


def get_multi_queries_report(queries):
    """Receives a dictionary of key:value pair of query_name:parameters, where parameters is a tuple"""
    data = dict()

    for query_name in queries:
        query_data = get_sql(query_name, parameters=queries[query_name])
        if isinstance(data, Exception):
            return Response(
                json.dumps({"error": str(data)}),
                status=500,
                mimetype="application/json",
            )

        data[query_name] = query_data

    return data
